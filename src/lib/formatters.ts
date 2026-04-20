export const maskPhone = (v: string) => {
  if (!v) return ''
  v = v.replace(/\D/g, '')
  if (v.length > 11) v = v.slice(0, 11)
  if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (v.length > 6) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  if (v.length > 2) return v.replace(/(\d{2})(\d{0,5})/, '($1) $2')
  return v
}

export const maskCPF = (v: string) => {
  if (!v) return ''
  v = v.replace(/\D/g, '')
  if (v.length > 11) v = v.slice(0, 11)
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export const maskCEP = (v: string) => {
  if (!v) return ''
  v = v.replace(/\D/g, '')
  if (v.length > 8) v = v.slice(0, 8)
  return v.replace(/(\d{5})(\d{1,3})/, '$1-$2')
}

export const maskRG = (v: string) => {
  if (!v) return ''
  v = v.replace(/[^A-Za-z0-9]/g, '')
  if (v.length > 9) v = v.slice(0, 9)
  return v
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})([A-Za-z0-9]{1,2})$/, '$1-$2')
}

export const validateCPF = (cpf: string) => {
  if (!cpf) return true
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i)
  let rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cpf.charAt(9))) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i)
  rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cpf.charAt(10))) return false
  return true
}

export const calculateAge = (birthday: string) => {
  if (!birthday) return null
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
