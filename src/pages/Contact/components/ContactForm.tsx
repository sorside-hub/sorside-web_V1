import React, { useState, useRef } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

export const ContactForm: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.current) return;
    
    setStatus('loading');

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('FAILED...', error);
      setStatus('error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  return (
    <form ref={form} onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2 group">
        <label htmlFor="name" className="block text-xs font-mono tracking-widest uppercase text-text-secondary group-focus-within:text-accent transition-colors">Name</label>
        <input 
          type="text" 
          id="name"
          name="name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent transition-colors font-sans text-sm rounded-none text-text-primary placeholder:text-border"
          placeholder="Your name"
          required
          disabled={status === 'loading'}
        />
      </div>
      
      <div className="space-y-2 group">
        <label htmlFor="email" className="block text-xs font-mono tracking-widest uppercase text-text-secondary group-focus-within:text-accent transition-colors">Email</label>
        <input 
          type="email" 
          id="email"
          name="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent transition-colors font-sans text-sm rounded-none text-text-primary placeholder:text-border"
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
        />
      </div>

      <div className="space-y-2 group">
        <label htmlFor="message" className="block text-xs font-mono tracking-widest uppercase text-text-secondary group-focus-within:text-accent transition-colors">Message</label>
        <textarea 
          id="message"
          name="message"
          rows={3}
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-transparent border-b border-border py-2 focus:outline-none focus:border-accent transition-colors font-sans text-sm resize-none rounded-none text-text-primary placeholder:text-border"
          placeholder="Your message..."
          required
          disabled={status === 'loading'}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`
            group flex items-center gap-3 border px-8 py-4 font-mono text-xs tracking-widest uppercase transition-colors
            ${status === 'success' 
              ? 'border-green-500/50 text-green-500 bg-green-500/10' 
              : status === 'error'
              ? 'border-red-500/50 text-red-500 bg-red-500/10'
              : 'border-text-primary hover:bg-text-primary hover:text-background'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span>
            {status === 'loading' ? 'Sending...' : 
             status === 'success' ? 'Sent' : 
             status === 'error' ? 'Failed' : 
             'Send Message'}
          </span>
          
          {status === 'loading' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle2 size={14} />
          ) : status === 'error' ? (
            <AlertCircle size={14} />
          ) : (
            <Send size={14} className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          )}
        </button>
      </div>
    </form>
  );
};
