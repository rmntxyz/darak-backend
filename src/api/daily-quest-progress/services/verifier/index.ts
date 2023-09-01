import login from "./login";

const VERIFIRE = {
  login,
};

export default {
  verify: async (user: User, progress: DailyQuestProgress) => {
    const { qid } = progress.daily_quest;
    const verifier = VERIFIRE[qid];

    if (!verifier) {
      return;
    }

    return await verifier(user, progress);
  },
};
