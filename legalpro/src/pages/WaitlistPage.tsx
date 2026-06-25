import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';

export function WaitlistPage() {
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [email, setEmail] = useState(prefillEmail);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    // Store locally
    const existing = JSON.parse(localStorage.getItem('juryfy_waitlist') || '[]');
    existing.push({ name, phone, occupation, email, date: new Date().toISOString() });
    localStorage.setItem('juryfy_waitlist', JSON.stringify(existing));

    // Send via Web3Forms
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: 'd3f775ae-3621-4e92-9a45-042e1fb44a89',
        subject: 'Juryfy AI - New Waitlist Registration',
        from_name: 'Juryfy AI Waitlist',
        to: 'juryfyai@gmail.com',
        message: `New waitlist registration:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nOccupation: ${occupation || 'Not provided'}\nDate: ${new Date().toLocaleString()}`,
        email: email,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setSubmitted(true);
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitted(true);
        setSubmitting(false);
      });
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f5f1e8' }}>
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo/JuryfyAIlogo.png" alt="Juryfy AI" className="w-20 h-20" />
            <span className="text-2xl font-bold italic" style={{ color: '#01696f' }}>JuryfyAI</span>
          </div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#3c3c3c' }}>
            Thank you, {name}!
          </h2>
          <p className="text-base mb-6" style={{ color: '#3c3c3c' }}>
            You're on the list. We'll notify you as soon as Juryfy AI goes live.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 text-white font-medium rounded-lg"
            style={{ backgroundColor: '#01696f' }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#f5f1e8' }}>
      <div className="w-full max-w-lg">
        {/* Logo + Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo/JuryfyAIlogo.png" alt="Juryfy AI" className="w-20 h-20 sm:w-24 sm:h-24" />
          <span className="text-2xl sm:text-3xl font-bold italic" style={{ color: '#01696f' }}>JuryfyAI</span>
        </div>

        {/* Tagline */}
        <div className="text-center mb-8">
          <p className="text-base sm:text-lg font-medium" style={{ color: '#3c3c3c' }}>
            Thank you for choosing JuryfyAI.
          </p>
          <p className="text-base sm:text-lg font-medium" style={{ color: '#3c3c3c' }}>
            We are preparing something powerful for you.
          </p>
          <p className="text-base sm:text-lg font-medium" style={{ color: '#3c3c3c' }}>
            Register your details to receive priority access when we go live.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-5 py-4 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-[#01696f]/30"
            style={{ backgroundColor: '#eeecea', borderColor: '#d4d0c8', color: '#3c3c3c' }}
          />
          <input
            type="tel"
            placeholder="Your Phone No (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-[#01696f]/30"
            style={{ backgroundColor: '#eeecea', borderColor: '#d4d0c8', color: '#3c3c3c' }}
          />
          <input
            type="text"
            placeholder="Your Occupation (optional)"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-[#01696f]/30"
            style={{ backgroundColor: '#eeecea', borderColor: '#d4d0c8', color: '#3c3c3c' }}
          />
          <input
            type="email"
            placeholder="Your Email Id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-4 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-[#01696f]/30"
            style={{ backgroundColor: '#eeecea', borderColor: '#d4d0c8', color: '#3c3c3c' }}
          />
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-3 text-white font-medium rounded-lg text-base transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#01696f' }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Back link */}
        <Link
          to="/"
          className="block text-center text-sm mt-6 transition-colors hover:underline"
          style={{ color: '#01696f' }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
