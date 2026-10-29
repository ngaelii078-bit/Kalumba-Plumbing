'use strict';

// The demo runs directly from index.html; no server or build step is needed.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const businessPhone = '27799565342';
$('#year').textContent = new Date().getFullYear();

// Mobile navigation remains keyboard accessible and closes on selection / Escape.
const menuButton = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function setMenu(open, returnFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !open;
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(mobileNav.hidden));
$$('a', mobileNav).forEach(link => link.addEventListener('click', () => setMenu(false)));
window.matchMedia('(min-width: 861px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

// Booking only prepares a message. Sending stays a deliberate visitor action.
const booking = $('#booking-form');
const sendBooking = $('#send-booking');
const bookingStatus = $('#booking-status');
function todayLocal() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
$('#booking-date').min = todayLocal();
function clearBookingMessage() {
  sendBooking.hidden = true;
  sendBooking.removeAttribute('href');
  bookingStatus.textContent = '';
}
booking.addEventListener('input', clearBookingMessage);
booking.addEventListener('change', clearBookingMessage);
$$('[data-service]').forEach(link => link.addEventListener('click', () => {
  $('#service-select').value = link.dataset.service;
  clearBookingMessage();
}));
booking.addEventListener('submit', event => {
  event.preventDefault();
  clearBookingMessage();
  const data = new FormData(booking);
  if (data.get('date') < todayLocal()) {
    $('#booking-date').min = todayLocal();
    bookingStatus.textContent = 'Please choose today or a future date.';
    bookingStatus.focus();
    return;
  }
  const message = [
    "Hi Kalumba Plumbing! I'd like to request a plumbing visit.", '',
    `Name: ${data.get('name').trim()}`,
    `Phone: ${data.get('phone').trim()}`,
    `Area: ${data.get('area').trim()}`,
    `Service: ${data.get('service')}`,
    `Preferred date: ${data.get('date')}`,
    `Notes: ${data.get('notes').trim() || 'None'}`, '',
    'Please confirm availability and pricing.'
  ].join('\n');
  sendBooking.href = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
  sendBooking.hidden = false;
  bookingStatus.textContent = 'Your request is ready. Review and send it in WhatsApp below. The team will confirm your visit.';
  bookingStatus.focus({ preventScroll: true });
  sendBooking.scrollIntoView({ block: 'nearest', behavior: motionPreference.matches ? 'instant' : 'smooth' });
});


const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const chatPanel=$('#chat-panel'),chatToggle=$('#chat-toggle'),chatInput=$('#chat-input'),chatLog=$('#chat-log');
function setChat(open){chatPanel.hidden=!open;chatToggle.setAttribute('aria-expanded',String(open));(open?chatInput:chatToggle).focus({preventScroll:true});}
chatToggle.addEventListener('click',()=>setChat(chatPanel.hidden));
$('#chat-close').addEventListener('click',()=>setChat(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!chatPanel.hidden)setChat(false);else if(!mobileNav.hidden)setMenu(false,true);}});
function addMessage(text,user=false){const msg=document.createElement('div');msg.className='message'+(user?' user':'');msg.textContent=text;chatLog.append(msg);chatLog.scrollTop=chatLog.scrollHeight;}
function reply(question){addMessage(question,true);let answer;const text=question.toLowerCase();
if(/price|cost|quote|rate/.test(text))answer='Prices depend on the job. Use the form to send your area, the plumbing issue and a preferred date. Confirm callout fees, parts and labour with the team before work starts.';
else if(/book|visit|date|appointment/.test(text))answer='Complete the enquiry form, prepare your WhatsApp request, then review and send it. The team will confirm availability directly. This guide cannot make bookings.';
else if(/area|where|location|direction/.test(text))answer='The business serves Klerksdorp, Stilfontein and Orkney. Call 079 956 5342 to check your suburb. The map shows the service area, rather than a workshop address.';
else if(/hour|open|urgent|emergency/.test(text))answer='The supplied business profile lists 24-hour opening. For urgent help, call 079 956 5342 to confirm current callout availability.';
else if(/service|leak|drain|geyser|toilet|tap|pipe|repair/.test(text))answer='Enquire about leak repairs, blocked drains, geysers and solar geysers, pipework, bathroom and kitchen plumbing, new installations and maintenance. Call or WhatsApp 079 956 5342 for your specific job.';
else answer='I am a demo guide with prepared answers. Ask about services, quotes, bookings or service areas. For personal assistance, call or WhatsApp 079 956 5342.';
addMessage(answer);}
$('#chat-form').addEventListener('submit',event=>{event.preventDefault();const q=chatInput.value.trim();if(q){reply(q);chatInput.value='';}});
$$('[data-question]').forEach(button=>button.addEventListener('click',()=>reply(button.dataset.question)));
const clamp = value => Math.min(1, Math.max(0, value));
const revealHeadings = $$('[data-reveal]').map(heading => {
  const visual = document.createElement('span');
  visual.className = 'reveal-visual';
  visual.setAttribute('aria-hidden', 'true');
  while (heading.firstChild) visual.append(heading.firstChild);
  const readable = document.createElement('span');
  readable.className = 'sr-only';
  // Preserve the space represented by a line break in the accessible heading.
  const label = visual.cloneNode(true);
  $$('br', label).forEach(br => br.replaceWith(' '));
  readable.textContent = label.textContent.replace(/\s+/g, ' ').trim();
  heading.append(readable, visual);
  const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const words = [];
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
      else {
        const word = document.createElement('span');
        word.className = 'reveal-word';
        word.textContent = part;
        words.push(word);
        fragment.append(word);
      }
    });
    node.replaceWith(fragment);
  });
  return { heading, words, current: null, lastPainted: -1 };
});

let frame = 0;
let lastTime = 0;
function paintHeading(item, progress) {
  if (Math.abs(item.lastPainted - progress) < .00005) return;
  item.lastPainted = progress;
  const overlap = 2.4;
  item.words.forEach((word, index) => {
    const step = clamp((progress * (item.words.length + overlap - 1) - index) / overlap);
    const eased = step * step * (3 - 2 * step);
    word.style.setProperty('--word-opacity', (.16 + .84 * eased).toFixed(4));
    word.style.setProperty('--word-y', `${((1 - eased) * 11).toFixed(2)}px`);
    word.style.setProperty('--word-blur', `${((1 - eased) * 2.2).toFixed(2)}px`);
  });
}
function animateWords(time) {
  frame = 0;
  const delta = lastTime ? Math.min(time - lastTime, 64) : 16.67;
  lastTime = time;
  const ease = 1 - Math.exp(-delta / 115);
  let changing = false;
  const height = window.innerHeight;
  const scroll = window.scrollY;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - height);
  revealHeadings.forEach(item => {
    const documentTop = item.heading.getBoundingClientRect().top + scroll;
    const start = Math.max(0, documentTop - height * .91);
    // Short sections near the footer still finish before the visitor runs out of scroll.
    const end = Math.min(maxScroll, documentTop - height * .42);
    const target = motionPreference.matches ? 1 : clamp((scroll - start) / Math.max(1, end - start));
    if (item.current === null || motionPreference.matches) item.current = target;
    else item.current += (target - item.current) * ease;
    if (Math.abs(target - item.current) < .0001) item.current = target;
    else changing = true;
    paintHeading(item, item.current);
  });
  if (changing) frame = requestAnimationFrame(animateWords);
  else lastTime = 0;
}
function queueReveal() {
  if (!frame) frame = requestAnimationFrame(animateWords);
}
window.addEventListener('scroll', queueReveal, { passive: true });
window.addEventListener('resize', queueReveal, { passive: true });
window.addEventListener('pageshow', queueReveal);
motionPreference.addEventListener('change', queueReveal);
$$('details').forEach(details => details.addEventListener('toggle', queueReveal));
if (document.fonts) document.fonts.ready.then(queueReveal);
queueReveal();
