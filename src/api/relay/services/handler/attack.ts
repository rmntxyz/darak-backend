async function verify(relay: Relay, result: AttackResult) {
  const { conditions } = relay.detail;
  const { status } = result;

  for (const condition of conditions) {
    const { amount, attack_status } = condition;

    if (status === attack_status) {
      return amount;
    }
  }

  return 0;
}

export default { verify };
