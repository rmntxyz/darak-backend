/**
 * attack service
 */

import { factories } from "@strapi/strapi";
import { ATTACK_NOTIFICATIONS, ErrorCode } from "../../../constant";

export default factories.createCoreService(
  "api::attack.attack",
  ({ strapi }) => ({
    async getRandoms(excluded = [0], count = 2, days = 5) {
      const { rows } = await strapi.db.connection.raw(`
SELECT u.id,
       COALESCE(SUM(CASE
                 WHEN se.symbol IN ('tr_damage', 'tl_glass_damage', 'btn_damage', 'bl_damage')
                      AND use.active = true THEN use.stack
                 ELSE 0
             END), 0) AS total_stack
FROM up_users u
LEFT JOIN user_status_effects_user_links usul ON u.id = usul.user_id
LEFT JOIN user_status_effects use ON usul.user_status_effect_id = use.id
LEFT JOIN user_status_effects_status_effect_links usesl ON use.id = usesl.user_status_effect_id
LEFT JOIN status_effects se ON usesl.status_effect_id = se.id
LEFT JOIN streaks_users_permissions_user_links supl ON u.id = supl.user_id
LEFT JOIN streaks s ON supl.streak_id = s.id
WHERE s.last_login_date >= NOW() - INTERVAL '${days} days'
  AND u.deactivated = false
  AND u.id NOT IN (${excluded.join(",")})
GROUP BY u.id
HAVING COALESCE(SUM(CASE
                      WHEN se.symbol IN ('tr_damage', 'tl_glass_damage', 'btn_damage', 'bl_damage')
                           AND use.active = true THEN use.stack
                      ELSE 0
                  END), 0) != 8  -- total_stack이 8이 아닌 경우
ORDER BY RANDOM()
LIMIT ${count};
`);

      return rows;
    },

    async getRevenges(userId, count = 10) {
      // const revenges = await strapi.db.connection
      //   .from(function () {
      //     this.table("attacks as a")
      //       .distinctOn("al.user_id")
      //       .select("al.user_id as id", "a.created_at as attacked_at")
      //       .join("attacks_attacker_links as al", "a.id", "al.attack_id")
      //       .join("attacks_target_links as tl", "a.id", "tl.attack_id")
      //       .join("up_users as u", "al.user_id", "u.id")
      //       .where("tl.user_id", userId)
      //       .andWhere(function () {
      //         this.whereNot("u.deactivated", true);
      //       })
      //       .orderBy([
      //         { column: "al.user_id" },
      //         { column: "a.created_at", order: "desc" },
      //       ])
      //       .as("subquery");
      //   })
      //   .orderBy("attacked_at", "desc")
      //   .limit(count);
      // return revenges;

      const { rows } = await strapi.db.connection.raw(`
SELECT *
FROM (
    SELECT DISTINCT ON (al.user_id)
        al.user_id AS id,
        a.created_at AS attacked_at,
        SUM(CASE 
                WHEN se.symbol IN ('tr_damage', 'tl_glass_damage', 'btn_damage', 'bl_damage')
                    AND use.active = true THEN COALESCE(use.stack, 0)
                ELSE 0 
            END) AS total_stack
    FROM attacks AS a
    LEFT JOIN attacks_attacker_links AS al ON a.id = al.attack_id
    LEFT JOIN attacks_target_links AS tl ON a.id = tl.attack_id
    LEFT JOIN up_users AS u ON al.user_id = u.id
    LEFT JOIN user_status_effects_user_links AS usul ON u.id = usul.user_id
    LEFT JOIN user_status_effects AS use ON usul.user_status_effect_id = use.id
    LEFT JOIN user_status_effects_status_effect_links AS usesl ON use.id = usesl.user_status_effect_id
    LEFT JOIN status_effects AS se ON usesl.status_effect_id = se.id
    WHERE
        tl.user_id = ${userId}
        AND u.deactivated = false
    GROUP BY 
        al.user_id, a.created_at
    ORDER BY 
        al.user_id, a.created_at DESC
) AS subquery
ORDER BY attacked_at DESC
LIMIT ${count};`);

      return rows;
    },

    async isAttackedin(userId, hours = 8) {
      const results = await strapi.entityService.findMany(
        "api::attack.attack",
        {
          filters: {
            target: {
              id: userId,
            },
            createdAt: {
              $gte: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
            },
          },
          fields: ["id"],
        }
      );

      if (results.length) {
        return true;
      }

      return false;
    },

    async sendAttackNotification(
      from: number,
      to: number,
      status: keyof typeof ATTACK_NOTIFICATIONS
    ) {
      let { device_token, language } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        to,
        {
          fields: ["device_token", "language"],
        }
      );

      language = language || "en";

      if (device_token) {
        const { username } = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          from,
          {
            fields: ["username"],
          }
        );

        const { notification } = strapi as unknown as ExtendedStrapi;
        const { title, body } = ATTACK_NOTIFICATIONS[status];

        return await notification.sendNotification(device_token, {
          notification: {
            title: title[language],
            body: body[language].replace("${username}", username),
          },
        });
      } else {
        throw ErrorCode.DEVICE_TOKEN_NOT_FOUND;
      }
    },
  })
);

export const TargetUserOptions = {
  fields: ["username"],
  populate: {
    status: {
      fields: ["level"],
    },
    avatar: {
      fields: ["id"],
      populate: {
        profile_picture: {
          fields: ["id"],
          populate: {
            image: {
              fields: ["url"],
            },
          },
        },
      },
    },
  },
};
