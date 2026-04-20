export function maskPhone(value: any): string {
  if (!value) return ''
  const str = String(value).replace(/\D/g, '')
  if (str.length === 0) return ''
  if (str.length <= 2) return `(${str}`
  if (str.length <= 6) return `(${str.slice(0, 2)}) ${str.slice(2)}`
  if (str.length <= 10) return `(${str.slice(0, 2)}) ${str.slice(2, 6)}-${str.slice(6)}`
  return `(${str.slice(0, 2)}) ${str.slice(2, 7)}-${str.slice(7, 11)}`
}

export function maskCPF(value: any): string {
  if (!value) return ''
  const str = String(value).replace(/\D/g, '')
  if (str.length === 0) return ''
  if (str.length <= 3) return str
  if (str.length <= 6) return `${str.slice(0, 3)}.${str.slice(3)}`
  if (str.length <= 9) return `${str.slice(0, 3)}.${str.slice(3, 6)}.${str.slice(6)}`
  return `${str.slice(0, 3)}.${str.slice(3, 6)}.${str.slice(6, 9)}-${str.slice(9, 11)}`
}

export function maskRG(value: any): string {
  if (!value) return ''
  const str = String(value).replace(/[^a-zA-Z0-9]/g, '')
  if (str.length === 0) return ''
  if (str.length <= 2) return str
  if (str.length <= 5) return `${str.slice(0, 2)}.${str.slice(2)}`
  if (str.length <= 8) return `${str.slice(0, 2)}.${str.slice(2, 5)}.${str.slice(5)}`
  return `${str.slice(0, 2)}.${str.slice(2, 5)}.${str.slice(5, 8)}-${str.slice(8, 9)}`
}

export function maskCEP(value: any): string {
  if (!value) return ''
  const str = String(value).replace(/\D/g, '')
  if (str.length === 0) return ''
  if (str.length <= 5) return str
  return `${str.slice(0, 5)}-${str.slice(5, 8)}`
}

export function validateCPF(cpf: any): boolean {
  if (!cpf) return false
  const str = String(cpf).replace(/\D/g, '')
  if (str.length !== 11) return false
  if (/^(\d)\1{10}$/.test(str)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(str.charAt(i)) * (10 - i)
  let rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(str.charAt(9))) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(str.charAt(i)) * (11 - i)
  rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(str.charAt(10))) return false
  return true
}

export function calculateAge(birthday: any): number {
  if (!birthday) return 0
  const birthDate = new Date(String(birthday))
  if (isNaN(birthDate.getTime())) return 0
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return Math.max(0, age)
}
