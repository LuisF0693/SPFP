export const whatsappService = {
  generateDeepLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  },

  formatTextForWhatsApp(content: string): string {
    const plainText = content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();

    return plainText;
  },

  sendViaWhatsApp(phone: string, message: string): void {
    const url = this.generateDeepLink(phone, message);
    window.open(url, '_blank', 'width=800,height=600');
  },

  validatePhone(phone: string, country: string = 'BR'): boolean {
    const cleanPhone = phone.replace(/\D/g, '');

    if (country === 'BR') {
      return /^55\d{10,11}$/.test(cleanPhone) || /^\d{10,11}$/.test(cleanPhone);
    }

    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  },

  formatPhoneNumber(phone: string, country: string = 'BR'): string {
    let clean = phone.replace(/\D/g, '');

    if (country === 'BR') {
      if (!clean.startsWith('55') && clean.length === 11) {
        clean = '55' + clean;
      }
    }

    return clean;
  },
};

export default whatsappService;
