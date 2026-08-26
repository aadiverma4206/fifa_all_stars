import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ChevronDown, ChevronUp, MapPin, Play, Compass, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import FootballScene from '../../components/football3d/FootballScene';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedArea) {
      navigate(`/games?city=${encodeURIComponent(selectedArea)}`);
    } else {
      navigate('/games');
    }
  };

  const reviews = [
    {
      name: 'Mac',
      location: 'Manchester',
      text: 'I love playing football, so being able to pick and choose when to play is the best thing ever. If I could give 10 stars, I would.'
    },
    {
      name: 'Zinedine',
      location: 'Birmingham',
      text: "Without Footy Addicts, I would've been depressed after moving to a new city and not playing football for a while as well as not having a group to play with."
    },
    {
      name: 'Gemma',
      location: 'London',
      text: 'I have actually turned into a bit of a Footy Addict, trying to get 3 or 4 games in per week.'
    }
  ];

  const faqs = [
    {
      q: 'How does Footy Addicts work?',
      a: 'Simply create a free account, browse open pick-up games near your area, book your spot online with a few clicks, and turn up at the pitch to play!'
    },
    {
      q: 'How can I join a game?',
      a: 'Go to the Find Games page, choose a date and venue that fits your schedule, click Join Game, and confirm your slot.'
    },
    {
      q: 'Can anybody create a new game?',
      a: 'Yes! Any registered player or venue manager can host a new game session, set the format (5v5 or 7v7), entry fee, and invite community players.'
    }
  ];

  const indianCities = [
    { name: 'Raipur', pitches: ['Bernabeu Arena Turf (VIP Road)', 'Telibandha Futsal Dome', 'Magneto Sports Pitch'] },
    { name: 'Bangalore', pitches: ['Silicon Turf Hub (Indiranagar)', 'Koramangala 3G Pitch', 'HSR Layout Arena'] },
    { name: 'Mumbai', pitches: ['Marine Drive Sports Complex', 'Bandra Futsal Turf', 'Andheri Sports Hub'] },
    { name: 'Pune', pitches: ['Champions Turf Arena (FC Road)', 'Deccan Gymkhana Turf', 'Kothrud Futsal Park'] },
    { name: 'Delhi', pitches: ['Chhatarpur Turf Ground', 'Dwarka Sports Complex', 'Saket Futsal Arena'] }
  ];

  return (
    <div className="space-y-16 py-4">
      
      {/* 1. HERO SECTION WITH 3D FOOTBALL ANIMATION */}
      <section className="relative rounded-3xl overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center p-6 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-950 text-white">
        <div className="absolute inset-0 bg-radial from-sport-500/15 via-slate-950/80 to-slate-950" />
        
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sport-500/10 border border-sport-500/30 text-sport-500 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>THE HOME OF CASUAL FOOTBALL</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase font-sans leading-none text-white">
              PLAY FOOTBALL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sport-500 via-amber-400 to-sky-400">
                WHENEVER YOU WANT
              </span>
            </h1>

            {/* Find a game near you box */}
            <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-2xl max-w-lg space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                Find a game near you
              </span>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 font-bold text-xs focus:ring-2 focus:ring-sport-500"
                >
                  <option value="">Select area</option>
                  <option value="Raipur">Raipur, Chhattisgarh</option>
                  <option value="Bangalore">Bangalore, Karnataka</option>
                  <option value="Mumbai">Mumbai, Maharashtra</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Pune">Pune, Maharashtra</option>
                </select>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs tracking-wide transition-all shadow-lg shadow-rose-500/30 whitespace-nowrap"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/login">
                <Button variant="primary" size="lg" icon={Play} className="px-8 shadow-xl shadow-sport-500/20">
                  Sign In to Play
                </Button>
              </Link>
              <Link to="/games">
                <Button variant="outline" size="lg" icon={Compass} className="px-8 border-slate-700 text-white hover:bg-slate-800">
                  Browse Pick-Up Games
                </Button>
              </Link>
            </div>
          </div>

          {/* 3D Scene */}
          <div className="lg:col-span-5 flex items-center justify-center relative min-h-[360px]">
            <FootballScene />
          </div>
        </div>
      </section>

      {/* 2. AS FEATURED ON & WELCOME SECTION */}
      <section className="footy-card p-8 sm:p-12 space-y-8 text-center sm:text-left">
        <div className="text-center space-y-4">
          <span className="text-xs font-black tracking-widest text-slate-400 uppercase">AS FEATURED ON</span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="text-xl font-black tracking-tighter text-slate-900 dark:text-white border-2 border-current px-3 py-1">B B C</div>
            <div className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-white">The Telegraph</div>
            <div className="text-xl font-serif italic font-bold text-slate-900 dark:text-white">London Evening Standard</div>
            <div className="text-xl font-sans font-bold text-slate-900 dark:text-white">Manchester Evening News</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Welcome to Footy Addicts / FIFA All Stars
          </h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
            We make playing casual football easy for thousands of football lovers around India. Our simple app gets you playing football on a pitch in your area faster than you can say tiki-taka. We pride ourselves in being the home of well organised games, dodgy bicycle kicks and last minute winners.
          </p>
        </div>
      </section>

      {/* 3. THE STATS NEVER LIE SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 p-8 sm:p-14 border border-slate-800 text-white text-center shadow-2xl">
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-10">The Stats Never Lie</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="text-3xl sm:text-5xl font-black text-white">285K<span className="text-rose-500">+</span></span>
            <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">REGISTERED PLAYERS</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-white">296K<span className="text-rose-500">+</span></span>
            <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">GAMES PLAYED</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-white">76K<span className="text-rose-500">+</span></span>
            <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">MAX SPOTS AVAILABLE</span>
          </div>
          <div>
            <span className="text-3xl sm:text-5xl font-black text-white">35K<span className="text-rose-500">+</span></span>
            <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">ACTIVE PLAYERS MONTHLY</span>
          </div>
        </div>
      </section>

      {/* 4. FIND. BOOK. PLAY. 3-STEP SECTION */}
      <section className="footy-card p-8 sm:p-14 space-y-10 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase">Where the football magic happens</h2>
          <p className="text-xs font-bold text-slate-400 uppercase">Best pitches to play football</p>
          <h3 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight pt-2">Find. Book. Play.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-sport-500/10 text-sport-500 flex items-center justify-center mx-auto text-3xl">⚽</div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Find your nearest football pitch with a quick scroll.</p>
          </div>
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-3xl">👆</div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Book your next game, with a few clicks.</p>
          </div>
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto text-3xl">👏</div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Play your best game. Have fun. Feel good.</p>
          </div>
        </div>
      </section>

      {/* 5. REVIEWS SECTION (PDF Page 3 & 4 Match) */}
      <section className="space-y-8 text-center">
        <div>
          <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">REVIEWS</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            What our community have to say about us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((rev, idx) => (
            <div key={idx} className="footy-card p-6 space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 space-x-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">"{rev.text}"</p>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{rev.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{rev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. THREE PILLARS & FAQ SECTION (PDF Page 5 Match) */}
      <section className="footy-card p-8 sm:p-12 space-y-10">
        <div className="space-y-4 max-w-3xl mx-auto text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase">Our ethos is built around three pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold pt-2">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-l-4 border-sport-500">
              <span className="block text-sport-500 font-black text-sm mb-1">Accessibility</span>
              <p className="text-slate-600 dark:text-slate-300">Click away from playing football anywhere.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-l-4 border-amber-500">
              <span className="block text-amber-500 font-black text-sm mb-1">Social Integration</span>
              <p className="text-slate-600 dark:text-slate-300">Enriching communities through sports.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-l-4 border-sky-500">
              <span className="block text-sky-500 font-black text-sm mb-1">Wellbeing</span>
              <p className="text-slate-600 dark:text-slate-300">Stronger physically & mentally.</p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Any questions? We got you.</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Our FAQ section is a great place to start if you've got a question.</p>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="footy-card p-4 rounded-2xl cursor-pointer" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{faq.q}</h4>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-sport-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
                {openFaq === idx && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PLAY FOOTBALL IN CITIES DIRECTORY (PDF Page 7 & 8 Match) */}
      <section className="footy-card p-8 sm:p-12 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Your local football pitch across India</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Wherever you are in India, we have pitches close by across Raipur, Bangalore, Mumbai, Pune, and Delhi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          {indianCities.map((city, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm text-sport-500">Play football in {city.name}</h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                {city.pitches.map((p, i) => (
                  <li key={i} className="hover:text-sport-500 cursor-pointer flex items-center space-x-1.5">
                    <span>•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
