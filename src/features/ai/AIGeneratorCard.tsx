import { FormEvent, useState } from 'react';

type Mode = 'english' | 'bangla' | 'banglish';

export function AIGeneratorCard() {
  const [result, setResult] = useState('');

  const onGenerate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name'));
    const price = String(fd.get('price'));
    const audience = String(fd.get('audience'));
    const mode = String(fd.get('mode')) as Mode;

    const templates: Record<Mode, string> = {
      english: `Hook: Stop scrolling! ${name} at only ${price}.\nProblem: ${audience} struggle with slow results and low confidence.\nSolution: ${name} delivers fast, practical value from day one.\nCTA: Reply now and grab yours today.\nSMS/WhatsApp: Hi! ${name} is now ${price}. Perfect for ${audience}. Want details?`,
      bangla: `হুক: থামুন! ${name} এখন মাত্র ${price}।\nসমস্যা: ${audience} প্রায়ই সঠিক সমাধান পায় না।\nসমাধান: ${name} দ্রুত ও কার্যকর ফল দেয়।\nCTA: আজই অর্ডার করতে মেসেজ করুন।\nSMS/WhatsApp: আসসালামু আলাইকুম! ${name} মাত্র ${price}, ${audience}-এর জন্য দারুণ। বিস্তারিত চান?`,
      banglish: `Hook: Oi dekhen! ${name} ekhon just ${price}.\nProblem: ${audience} regular bhabe bhalo option paito na.\nSolution: ${name} use korlei quick benefit paben.\nCTA: Inbox din, aajkei order confirm korun.\nSMS/WhatsApp: Hi! ${name} price ${price}. ${audience} der jonno best choice. Niben?`,
    };

    setResult(templates[mode]);
  };

  return (
    <div className="card">
      <h3>AI Ad Generator</h3>
      <form className="form" onSubmit={onGenerate}>
        <input name="name" placeholder="Product name" required />
        <input name="price" placeholder="Price" required />
        <input name="audience" placeholder="Audience" required />
        <select name="mode" defaultValue="english">
          <option value="english">English</option>
          <option value="bangla">Bangla</option>
          <option value="banglish">Banglish</option>
        </select>
        <button type="submit">Generate</button>
      </form>
      {result && <pre className="modal" style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>}
    </div>
  );
}
