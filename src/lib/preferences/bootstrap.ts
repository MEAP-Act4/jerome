export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{
var k='jerome.preferences.v1';
var raw=localStorage.getItem(k);
var p=raw?JSON.parse(raw):{};
var a=(p&&p.appearance)||{};
var theme=a.theme||'light';
var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
var dark=theme==='dark'||(theme==='system'&&prefersDark);
var r=document.documentElement;
r.classList.toggle('dark',dark);
r.dataset.density=a.density||'comfortable';
r.dataset.font=a.fontScale||'default';
r.dataset.motion=a.reduceMotion?'reduced':'full';
if(a.highContrast){r.classList.add('high-contrast');}
var accents={lime:['207 235 137','169 206 91'],green:['102 199 160','58 148 112'],blue:['111 168 207','74 127 165'],violet:['156 139 196','124 107 174'],orange:['224 168 106','212 136 74'],rose:['217 133 133','192 80 80']};
var acc=accents[a.accent]||accents.lime;
r.style.setProperty('--accent',acc[0]);
r.style.setProperty('--accent-strong',acc[1]);
}catch(e){}})();`;
