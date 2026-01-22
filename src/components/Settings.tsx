import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { User, Mail, Phone, FileText, Heart, Users, Save, Baby, Check, Moon, Sun, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';


/**
 * Settings component.
 * Handles user profile management, appearance settings (theme), 
 * and AI provider configurations.
 */
export const Settings: React.FC = () => {
    const { userProfile, updateUserProfile } = useFinance();
    const [formData, setFormData] = useState(userProfile);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setFormData(userProfile);
    }, [userProfile]);

    const handleChange = (field: keyof typeof userProfile, value: any) => {
        let finalValue = value;
        // Trim tokens to prevent copy-paste errors
        if (typeof value === 'string' && (field === 'apiToken' || field === 'geminiToken')) {
            finalValue = value.trim();
        }
        setFormData(prev => ({ ...prev, [field]: finalValue }));
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

                {/* === SECTION: APPEARANCE === */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <ImageIcon className="mr-2 text-purple-500" size={20} />
                        Aparência & Perfil
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-3">Tema do Aplicativo</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                                <button
                                    type="button"
                                    onClick={() => handleChange('theme', 'light')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.theme !== 'dark' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Sun size={16} />
                                    <span>Claro</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleChange('theme', 'dark')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.theme === 'dark' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Moon size={16} />
                                    <span>Escuro</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Foto de Perfil</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 border-2 border-gray-100 dark:border-gray-600">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=User')} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={32} /></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    handleChange('avatar', reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                        id="avatar-upload"
                                    />
                                    <label
                                        htmlFor="avatar-upload"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-lg transition-colors"
                                    >
                                        <ImageIcon size={16} className="mr-2" />
                                        Escolher Foto
                                    </label>
                                    <p className="text-xs text-gray-400 mt-1">PNG ou JPEG, máx. 5MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                                <div className="row-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Foto do Cônjuge</label>
                                    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                                        <div className="w-16 h-16 rounded-full bg-pink-100 overflow-hidden flex-shrink-0 border-2 border-pink-200">
                                            {formData.spouseAvatar ? (
                                                <img src={formData.spouseAvatar} alt="Spouse" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-pink-300"><Heart size={24} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            handleChange('spouseAvatar', reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="hidden"
                                                id="spouse-avatar-upload"
                                            />
                                            <label
                                                htmlFor="spouse-avatar-upload"
                                                className="cursor-pointer inline-flex items-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                <ImageIcon size={14} className="mr-2" />
                                                Escolher Foto
                                            </label>
                                        </div>
                                    </div>
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
                                <div className="md:col-span-1">
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
                            <div className="animate-fade-in space-y-4">
                                {(formData.children || []).map((child, index) => (
                                    <div key={child.id || index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <div className="relative group">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden border border-blue-200 flex items-center justify-center text-blue-300">
                                                {child.avatar ? <img src={child.avatar} alt="Child" className="w-full h-full object-cover" /> : <Baby size={20} />}
                                            </div>
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                                <ImageIcon size={16} className="text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const newChildren = [...(formData.children || [])];
                                                            newChildren[index] = { ...newChildren[index], avatar: reader.result as string };
                                                            handleChange('children', newChildren);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm font-medium py-1"
                                                placeholder="Nome do Filho(a)"
                                                value={child.name}
                                                onChange={(e) => {
                                                    const newChildren = [...(formData.children || [])];
                                                    newChildren[index] = { ...newChildren[index], name: e.target.value };
                                                    handleChange('children', newChildren);
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newChildren = formData.children.filter((_, i) => i !== index);
                                                handleChange('children', newChildren);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newChild = { id: Math.random().toString(36).substr(2, 9), name: '', avatar: '' };
                                        handleChange('children', [...(formData.children || []), newChild]);
                                    }}
                                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-xs hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Adicionar Filho(a)
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-black p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mr-3 text-sm">💡</span>
                            Inteligência Artificial & Dados
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">Cotações de Investimentos</h4>
                                <p className="text-xs text-gray-500">
                                    Utilizando **Yahoo Finance** (Sem necessidade de Token).
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provedor de Inteligência Artificial</label>
                                <select
                                    value={formData.aiConfig?.provider || 'google'}
                                    onChange={(e) => {
                                        const provider = e.target.value as any;
                                        handleChange('aiConfig', {
                                            ...(formData.aiConfig || {}),
                                            provider,
                                            // Set reasonable defaults for new providers
                                            baseUrl: provider === 'openai' ? 'https://api.openai.com/v1' : (formData.aiConfig?.baseUrl || ''),
                                            model: provider === 'google' ? 'gemini-1.5-flash' : (provider === 'openai' ? 'gpt-4o-mini' : (formData.aiConfig?.model || ''))
                                        });
                                    }}
                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 mb-4"
                                >
                                    <option value="google">Google Gemini (Recomendado)</option>
                                    <option value="openai">OpenAI (ChatGPT)</option>
                                    <option value="custom">Customizado (DeepSeek, Groq, Ollama...)</option>
                                </select>

                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Chave de API (API Key)</label>
                                        <input
                                            type="password"
                                            value={formData.aiConfig?.apiKey || (formData.aiConfig?.provider === 'google' ? formData.geminiToken : '') || ''}
                                            onChange={(e) => handleChange('aiConfig', { ...(formData.aiConfig || {}), apiKey: e.target.value })}
                                            placeholder="Cole sua API Key aqui"
                                            className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 font-mono text-sm"
                                        />
                                    </div>

                                    {(formData.aiConfig?.provider === 'openai' || formData.aiConfig?.provider === 'custom') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Base URL (opcional)</label>
                                                <input
                                                    type="text"
                                                    value={formData.aiConfig?.baseUrl || ''}
                                                    onChange={(e) => handleChange('aiConfig', { ...(formData.aiConfig || {}), baseUrl: e.target.value })}
                                                    placeholder="https://api.openai.com/v1"
                                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Modelo (ex: gpt-4o)</label>
                                                <input
                                                    type="text"
                                                    value={formData.aiConfig?.model || ''}
                                                    onChange={(e) => handleChange('aiConfig', { ...(formData.aiConfig || {}), model: e.target.value })}
                                                    placeholder="gpt-4o-mini"
                                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        {formData.aiConfig?.provider === 'google' ? (
                                            <>Gere sua chave gratuita em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold">Google AI Studio</a>.</>
                                        ) : formData.aiConfig?.provider === 'openai' ? (
                                            <>Gere sua chave em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold">OpenAI Dashboard</a>.</>
                                        ) : (
                                            <>Use qualquer API compatível com o padrão OpenAI. Ideal para DeepSeek, Local Ollama ou Provedores de Proxy.</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
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