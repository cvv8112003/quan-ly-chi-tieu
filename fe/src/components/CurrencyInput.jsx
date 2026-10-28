import { useState, useEffect } from 'react'

export function CurrencyInput({ value, onChange, disabled, required, placeholder, className }) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setDisplayValue(new Intl.NumberFormat('vi-VN').format(value))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    onChange(rawValue === '' ? '' : Number(rawValue))

    if (rawValue === '') {
      setDisplayValue('')
    } else {
      setDisplayValue(new Intl.NumberFormat('vi-VN').format(Number(rawValue)))
    }
  }

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        required={required}
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} pr-8`}
      />
      <span className="absolute right-4 text-sm font-bold text-slate-400 pointer-events-none">
        đ
      </span>
    </div>
  )
}