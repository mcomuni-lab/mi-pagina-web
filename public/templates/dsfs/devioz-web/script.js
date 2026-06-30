// Active nav on scroll
const sections=document.querySelectorAll('section[id]');
const links=document.querySelectorAll('.nav-links a');
window.addEventListener('scroll',()=>{
  const y=window.scrollY+150;
  sections.forEach(s=>{
    if(y>=s.offsetTop && y<s.offsetTop+s.offsetHeight){
      links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+s.id));
    }
  });
});
