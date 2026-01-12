const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace the "Na sacola" button with a regular buy button
const inCartButton = `disabled="" class="Button_Button__Msu2a Button_Primary__anIDa BuyButton_StoreFrontBuyButton__Zykdy BuyButton_Light__yoKPW BuyButton_inCart__cWjg1" data-type="buy"><div class="BuyButton_ContentWrapper__pg5il"><div class="Success_Wrapper__U0DcH BuyButton_Icon__gacm5"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="none"><circle cx="12" cy="12" r="8"></circle><path d="M8.5 11.4375C8.72856 12.1003 9.22793 14.6326 10.0046 13.8912C11.8333 12.4792 13.75 10.8125 15.4167 9.5625" stroke-width="1.25" stroke-linecap="round"></path></g></svg></div>Na sacola`;

const buyButton = `class="Button_Button__Msu2a Button_Primary__anIDa BuyButton_StoreFrontBuyButton__Zykdy BuyButton_Light__yoKPW" data-type="buy"><div class="BuyButton_ContentWrapper__pg5il"><svg width="32" height="33" viewBox="0 0 32 33" class="BuyButton_Icon__gacm5 BuyButton_WithContent__L0cYC BuyButton_DarkIcon__wl4KO" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 26.0002H5L7.14285 12.0715L20 6.04834V26.0002Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20 6.04834L25 10.1126L27 26.0002H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.5239 9.79013L16.5239 8.00974C16.5239 6.20552 15.2184 4.60759 13.3811 5.08582C10.9769 5.71158 10.2382 8.1223 10.2382 11.4349L10.2382 12.4651" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>45,90&nbsp;R$`;

html = html.replace(inCartButton, buyButton);

fs.writeFileSync('index.html', html);
console.log('✅ Botão "Na sacola" removido!');
