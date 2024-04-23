async function verify(relay: Relay, result: CapsuleResult) {
  const { conditions } = relay.detail;
  const { rewards } = result;

  for (const condition of conditions) {
    const { amount, reward_type, rarity } = condition;

    const target = rewards.find((reward) => {
      if (reward_type === reward.type) {
        if (reward_type === "item") {
          if (rarity) {
            return reward.detail.rarity === rarity;
          } else {
            return true;
          }
        } else {
          return true;
        }
      }
    });

    if (target) {
      return amount;
    }
  }

  return 0;
}

export default { verify };
