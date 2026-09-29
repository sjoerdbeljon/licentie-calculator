# licentie-calculator
Licentie calculator

Statische pagina (GitHub Pages). Alle CSS, fonts en JavaScript staan lokaal in `assets/`, zodat de pagina niet afhangt van externe CDN's en een strikte Content-Security-Policy kan gebruiken.

Na het toevoegen van nieuwe Tailwind-classes in `index.html` of `assets/js/app.js` de CSS opnieuw bouwen:

```
npx tailwindcss@3 -i assets/css/tailwind.src.css -o assets/css/tailwind.css --minify
```
