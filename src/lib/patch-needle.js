
const patchNeedle = async (context, filePath, params) => {
  const { ignite, print } = context
  try {
    await ignite.patchInFile(filePath, params)
  } catch (e) {
    print.warning(`Could not find insertion point in ${filePath}:\n${params.before}`)
  }
}

module.exports = {
  patchNeedle
}
