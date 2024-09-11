/**
 * attack service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::attack.attack",
  ({ strapi }) => ({
    async getRandoms(excluded = [0], count = 2, days = 3) {
      const { rows } = await strapi.db.connection.raw(`
SELECT u.id,
       COUNT(CASE 
                 WHEN se.name IN ('part1_broken', 'part2_broken', 'part3_broken', 'part4_broken')
                      AND use.active = true THEN 1 
                 ELSE NULL 
             END) AS active_broken_count
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
ORDER BY 
         CASE WHEN COUNT(CASE 
                           WHEN se.name IN ('part1_broken', 'part2_broken', 'part3_broken', 'part4_broken')
                                AND use.active = true THEN 1 
                           ELSE NULL 
                        END) = 8 THEN 1 ELSE 0 END,
         RANDOM()
LIMIT ${count};
`);
      return rows;
    },

    async getRevenges(userId, count = 10) {
      const revenges = await strapi.db.connection
        .from(function () {
          this.table("attacks as a")
            .distinctOn("al.user_id")
            .select("al.user_id as id", "a.created_at as attacked_at")
            .join("attacks_attacker_links as al", "a.id", "al.attack_id")
            .join("attacks_target_links as tl", "a.id", "tl.attack_id")
            .where("tl.user_id", userId)
            .orderBy([
              { column: "al.user_id" },
              { column: "a.created_at", order: "desc" },
            ])
            .as("subquery");
        })
        .orderBy("attacked_at", "desc")
        .limit(count);

      return revenges;
    },

    async getFriends(userId) {
      return [];
    },
  })
);

export const TargetUserOptions = {
  fields: ["username"],
  populate: {
    status: {
      fields: ["level"],
    },
    profile_picture: {
      fields: ["id"],
      populate: {
        image: {
          fields: ["url"],
        },
      },
    },
  },
};
