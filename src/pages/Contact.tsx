import { Mail, Send } from 'lucide-react';

export function Contact() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full gap-6">
      <div className="flex-none">
        <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
          <Mail className="text-primary" />
          Contact Us
        </h1>
        <p className="text-muted-foreground mt-1">
          Found a bug or have a suggestion? Reach out.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name"
              className="w-full h-10 bg-background border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              className="w-full h-10 bg-background border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
            <textarea 
              id="message"
              className="w-full h-32 bg-background border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
              placeholder="How can we help?"
            ></textarea>
          </div>
          <button 
            type="submit"
            className="h-10 px-6 bg-primary text-primary-foreground font-medium rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Send size={16} />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
