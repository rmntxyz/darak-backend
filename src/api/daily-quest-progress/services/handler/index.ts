import draw from "./draw";

const Handler = {
  draw,
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

  claimRewards: async (user: User, progress: DailyQuestProgress) => {
    const { qid } = progress.daily_quest;
    const handler = Handler[qid];

    if (!handler) {
      return null;
    }

    return await handler.claimRewards(user, progress);
  },
};
