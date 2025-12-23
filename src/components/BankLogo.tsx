import React, { useState, useEffect } from 'react';
import { AccountType } from '../types';
import { Building, CreditCard, Banknote, Briefcase, Wallet } from 'lucide-react';

interface BankLogoProps {
  name: string;
  type: AccountType;
  size?: number;
}

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const bankDomains: Record<string, string> = {
  'nubank': 'nubank.com.br',
  'inter': 'bancointer.com.br',
  'c6': 'c6bank.com.br',
  'neon': 'neon.com.br',
  'next': 'next.me',
  'original': 'bancooriginal.com.br',
  'pan': 'bancopan.com.br',
  'will': 'willbank.com.br',
  'digio': 'digio.com.br',
  'iti': 'iti.itau',
  'agibank': 'agibank.com.br',
  'pagbank': 'pagbank.com.br',
  'mercadopago': 'mercadopago.com.br',
  'picpay': 'picpay.com',
  'itau': 'itau.com.br',
  'bradesco': 'bradesco.com.br',
  'banco do brasil': 'bb.com.br',
  'santander': 'santander.com.br',
  'caixa': 'caixa.gov.br',
  'safra': 'safra.com.br',
  'btg': 'btgpactual.com',
  'xp': 'xpi.com.br',
  'rico': 'rico.com.vc',
  'clear': 'clear.com.br',
  'avenue': 'avenue.us',
  'nomad': 'nomadglobal.com',
  'wise': 'wise.com',
};

export const BankLogo: React.FC<BankLogoProps> = ({ name, type, size = 24 }) => {
  const [imageError, setImageError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    const cleanName = removeAccents(name.trim().toLowerCase());
    const keys = Object.keys(bankDomains).sort((a, b) => b.length - a.length);
    const foundKey = keys.find(key => cleanName.includes(removeAccents(key)));
    
    if (foundKey) {
      const domain = bankDomains[foundKey];
      // Usando o serviço de favicon do Google que é mais estável
      setLogoUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      setImageError(false);
    } else {
      setLogoUrl(null);
    }
  }, [name]);

  const GenericIcon = () => {
    const iconProps = { size: size * 0.7, className: "text-gray-400" };
    switch(type) {
      case 'CHECKING': return <Building {...iconProps} />;
      case 'CREDIT_CARD': return <CreditCard {...iconProps} />;
      case 'CASH': return <Banknote {...iconProps} />;
      case 'INVESTMENT': return <Briefcase {...iconProps} />;
      default: return <Wallet {...iconProps} />;
    }
  };

  if (logoUrl && !imageError) {
    return (
      <img 
        src={logoUrl} 
        alt={name}
        className="object-contain rounded-md" 
        style={{ width: size, height: size }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-100 rounded-md" style={{ width: size, height: size }}>
      <GenericIcon />
    </div>
  );
};