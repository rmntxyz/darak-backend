import draw_common from "./draw_common";
import draw_mint from "./draw_mint";
import draw_spin from "./draw_spin";
import draw_uncommon from "./draw_uncommon";
import draw_yellow from "./draw_yellow";
import x3_draw from "./x3_draw";
import x5_draw from "./x5_draw";
import attack from "./attack";

const Handler = {
  attack,
  x3_draw,
  x5_draw,
  draw_mint,
  draw_yellow,
  draw_common,
  draw_uncommon,
  draw_spin,
};

export default {
  verify: async (userId: number, progress: DailyQuestProgress) => {
    const { qid } = progress.daily_quest;
    const handler = Handler[qid];

    if (!handler) {
      return null;
    }

    return await handler.verify(userId, progress);
  },

  claimRewards: async (user: User, userQuest: DailyQuestProgress) => {
    const { rewards } = userQuest.daily_quest;

    await strapi
      .service("api::reward.reward")
      .claim(user.id, rewards, "daily_quest_reward");

    return rewards;
  },
};
