exports.generateClaimID = () => {
  // Generate a random number, convert it to base 36, and extract digits 2 to 10
  // The substring starts at index 2 to skip the "0." part of the decimal result from Math.random()
  let claimID = Math.random().toString(36).substring(2, 10)

  // Ensure the ID is 8 characters long
  if (claimID.length < 8) {
    // If it's shorter than 8, recursively generate another ID (rare case)
    return this.generateClaimID()
  }

  return claimID
}
