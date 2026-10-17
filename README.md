# Dutch Barn Vodka: PDP buy box CRO test

A CRO design challenge for the [Dutch Barn Vodka product page](https://dutchbarn.com/products/dutch-barn-vodka). The brief was to pick the first thing I'd test to improve conversion, redesign the page around that hypothesis, and show what changed and why.

This isn't a full redesign. I changed one thing, the buy box, and kept everything else as it is on the live site.

**Open `index.html` in a browser to view it.** It's a single self-contained file (fonts and images are embedded), so it works offline and on GitHub Pages.

## What's inside

The page has two views, switched from the bar at the top:

- **Interactive Prototype.** The full product page in Dutch Barn's current design (the dark Halloween theme, their fonts, colours and photography), with the redesigned buy box. You can pick a bundle, switch between one-time and Subscribe & Save, see delivery update, and add to a simulated cart. Desktop and mobile previews are built in.
- **CRO Case Study.** The problem, hypothesis, an interactive before/after with numbered annotations, the four design decisions, and the A/B testing plan with a sample-size calculator.

The before/after uses the same buy box component as the prototype, so what reviewers compare is the working design, not a separate mockup.

## The problem

On the live page (checked 16 Oct 2026), someone who just wants a bottle of the Original runs into:

- **No price above the button.** The only price is inside "Add to cart £30.00", and it stays at £30.00 even when the quantity is set to 6.
- **Two competing ways to buy.** A single-bottle Add to Cart sits right above a six-flavour bundle builder with its own button.
- **Three add-to-cart buttons.** Add to Cart, the bundle button, and the same bundle button again in a sticky bar that follows you down the page. There are also six orange "Add +" buttons.
- **Hidden savings.** 2 bottles for £56 and 6 for £150 are set up in the theme, with "Most popular" and "Best value" badges, but they aren't shown.
- **Terms out of view.** The Subscribe & Save toggle says "cancel anytime", while the 60-day minimum term is behind a "Find out more" link.

## Hypothesis

Because the buy box shows two competing purchase paths, three add-to-cart buttons, and no visible price or savings for the product people came for, I believe one guided choice (how many bottles → one-time or subscribe → one button with a live price) will make value easier to judge and reduce hesitation.

I'll know it worked if add-to-cart rate goes up for the variant without revenue per visitor going down.

## What changed

1. **Purchase options.** One flow: quantity, then purchase type, then one button. The mix & match builder is still there, folded away below the button.
2. **Pricing.** A headline price that follows the selection, with the full price struck through, price per bottle, and the saving on every option.
3. **Add to cart.** One button that says what you're getting, like "Add 2 bottles · £56.00", and updates with every choice.
4. **Delivery and subscription terms.** Delivery cost updates with the selection and says why it's free. Choosing Subscribe & Save shows the terms, including the 60-day minimum.

Everything outside the buy box is unchanged, so a test result can be traced back to this change. The redesign also defaults to 1 bottle, the same as today, so pre-selecting a bundle doesn't muddy the result.

## Testing plan

- 50/50 split between the current buy box (Control A) and the redesign (Variant B), on this product page only
- **Primary metric:** add-to-cart rate
- **Secondary:** checkout initiation, purchase conversion, AOV, multi-bottle share, subscription take rate
- **Guardrail:** revenue per visitor
- Mobile and desktop reported separately
- Run length comes from a sample-size calculation, not a fixed number of days. With placeholder inputs (9% baseline add-to-cart rate, 10% relative lift, 95% confidence, 80% power) that's about 16,600 sessions per variant. The calculator in the case study takes real traffic numbers.

There are no results yet. Every expected effect is a hypothesis until the test runs.

## Things to confirm

- The 2-for-£56 and 6-for-£150 pricing, the badges and free shipping on bundles come from theme blocks that are currently hidden on the live page. Worth confirming they're still a valid offer.
- The 10% subscription discount is applied on top of the bundle price. Worth confirming how the subscription app stacks it.
- Mix & match pricing in the prototype matches what the live builder showed: £30 a bottle for the first three, £25 after that.

## Project structure

```
index.html        The built page. Open this.
src/app.jsx       React components: prototype, buy boxes, case study
src/styles.css    Styles, using the colour values captured from the live site
assets/           Product photography, icons and display fonts, captured from dutchbarn.com
build.js          Compiles the JSX and inlines CSS, fonts and images into index.html
```

To rebuild after editing the source:

```
npm install
npm run build
```

React 18 loads from cdnjs, and Poppins and Oswald come from Google Fonts. Everything else is embedded in the page.

### Deploying to Vercel

Import the repo into Vercel and deploy with the default settings. `vercel.json` tells Vercel to run the build and serve the `public/` folder, which the build creates alongside `index.html`.

## Credits

Product photography, logos, icons, the Spooky and Gobold display fonts, and product copy belong to Dutch Barn Vodka. They're used here only to present this design test. This prototype isn't affiliated with or published by Dutch Barn, and its cart is simulated.

Design and case study by Sabrina.
