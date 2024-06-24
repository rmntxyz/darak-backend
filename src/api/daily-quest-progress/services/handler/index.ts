import draw_mint from "./draw_mint";
import draw_uncommon from "./draw_uncommon";
import draw_yellow from "./draw_yellow";

const Handler = {
  draw_mint,
  draw_yellow,
  draw_uncommon,
};

export default {
  verify: async (user: User, progress: DailyQuestProgress) => {
    const { qid } = progress.daily_quest;
    const handler = Handler[qid];

    if (!handler) {
      return null;
    }

    return await handler.verify(user, progress);
  },

  claimRewards: async (user: User, userQuest: DailyQuestProgress) => {
    if (!userQuest.is_completed) {
      throw new Error("Quest is not completed yet");
    }

    if (userQuest.is_reward_claimed) {
      throw new Error("Rewards already claimed");
    }

    const { rewards } = userQuest.daily_quest;

    await strapi
      .service("api::reward.reward")
      .claim(user.id, rewards, "daily_quest_reward");

    return rewards;
  },
};
