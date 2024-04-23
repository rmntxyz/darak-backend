async function verify(relay) {
  const { conditions } = relay.detail;
  const random_number = Math.random();
  let total_probability = 0;

  for (const condition of conditions) {
    total_probability += condition.probability;
    if (random_number < total_probability) {
      return condition.amount;
    }
  }

  return 0;
}

export default { verify };
