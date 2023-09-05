import login from "./login";

const VERIFIRE = {
  login,
};

export default {
  verify: async (userId: number, progress: DailyQuestProgress) => {
    const { qid } = progress.daily_quest;
    const verifier = VERIFIRE[qid];

    if (!verifier) {
      return null;
    }

    return await verifier(userId, progress);
  },
};
