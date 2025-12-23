import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { User, Mail, Phone, FileText, Heart, Users, Save, Baby, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const { userProfile, updateUserProfile } = useFinance();
  const [formData, setFormData] = useState(userProfile);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
      setFormData(userProfile);
  }, [userProfile]);

  const handleChange = (field: keyof typeof userProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="p-5 md:p-0 max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
             <p className="text-gray-500">Gerencie seus dados pessoais.</p>
          </div>
          {showSuccess && (
              <div className="flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full shadow-sm animate-fade-in">
                  <div className="bg-emerald-100 rounded-full p-0.5 mr-2">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-bold">Dados salvos com sucesso</span>
              </div>
          )}
      </div>

      <div className="space-y-8">
        
        {/* === SECTION: PROFILE === */}
        <form onSubmit={handleSubmitProfile} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <User className="mr-2 text-primary" size={20} />
                    Dados Pessoais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Nome Completo</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">CPF</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                placeholder="000.000.000-00"
                                value={formData.cpf}
                                onChange={(e) => handleChange('cpf', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">E-mail</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="email" 
                                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Telefone / Celular</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="tel" 
                                className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cônjuge */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <Heart className="mr-2 text-pink-500" size={20} />
                        Dados do Cônjuge
                    </h2>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Incluir Cônjuge?</span>
                        <button 
                            type="button"
                            onClick={() => handleChange('hasSpouse', !formData.hasSpouse)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${formData.hasSpouse ? 'bg-pink-500' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${formData.hasSpouse ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                {formData.hasSpouse && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Nome do Cônjuge</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                value={formData.spouseName}
                                onChange={(e) => handleChange('spouseName', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">CPF do Cônjuge</label>
                            <input 
                                type="text" 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                placeholder="000.000.000-00"
                                value={formData.spouseCpf}
                                onChange={(e) => handleChange('spouseCpf', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">E-mail do Cônjuge</label>
                            <input 
                                type="email" 
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                value={formData.spouseEmail}
                                onChange={(e) => handleChange('spouseEmail', e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Filhos */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <Baby className="mr-2 text-blue-400" size={20} />
                        Filhos
                    </h2>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Possui filhos?</span>
                        <button 
                            type="button"
                            onClick={() => handleChange('hasChildren', !formData.hasChildren)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${formData.hasChildren ? 'bg-blue-400' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${formData.hasChildren ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                {formData.hasChildren && (
                    <div className="animate-fade-in">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Nome dos filhos (separe por vírgula)</label>
                        <textarea 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                            rows={3}
                            placeholder="Ex: Pedro, Ana, Lucas"
                            value={formData.childrenNames}
                            onChange={(e) => handleChange('childrenNames', e.target.value)}
                        ></textarea>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button 
                    type="submit" 
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center transform hover:scale-[1.02] active:scale-95"
                >
                    <Save className="mr-2" size={20} />
                    Salvar Perfil
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;