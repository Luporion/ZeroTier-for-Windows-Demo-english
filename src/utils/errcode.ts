export const errcodeMatch: Record<string, number> = {
  'no such file': 800,//Not installed
  'connect ECONNREFUSED': 800,//Service not started
}
export const CodeName: Record<string, number> = {
  NoInstall: 800,
  NoService: 801,
}