# feature-autocorrect for sms-eval.js
  
context:
```js
import { push, slide, make } from "./sms-eval.js"

function add(a, b) {
    return a + b
}
```
  
current:
```js
push = 5; push = 3; slide = add;
// [8]
```
  
new:
```js
psh = 5; ph = 3; sld = ad
// [8]
```
  
SMS is at a payment per letter so if this demo does work it also can help better things.
