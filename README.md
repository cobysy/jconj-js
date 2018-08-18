# jconj-js
JS port of a table-based Japanese word conjugator (https://github.com/yamagoya/jconj)

My first piece of JS code. Not properly tested so use at own risk :)

Example

```
DEBUG=conj-js ./index.js vk 来る くる
```

Output
```
Non-past aff-plain:   来る【くる】
Non-past aff-formal:  来ます【きます】
Non-past neg-plain:   来ない【こない】
Non-past neg-formal:  来ません【きません】
Past (~ta) aff-plain:   来た【きた】
Past (~ta) aff-formal:  来ました【きました】
Past (~ta) neg-plain:   来なかった【こなかった】
Past (~ta) neg-formal:  来ませんでした【きませんでした】
Conjunctive (~te) aff-plain:   来て【きて】
Conjunctive (~te) aff-formal:  来まして【きまして】
Conjunctive (~te) neg-plain:   来なくて【こなくて】
Conjunctive (~te) neg-plain:   来ないで【こないで】
Conjunctive (~te) neg-formal:  来ませんで【きませんで】
Provisional (~eba) aff-plain:   来れば【くれば】
Provisional (~eba) aff-formal:  来ますなら【くますなら】
Provisional (~eba) aff-formal:  来ますならば【くますならば】
Provisional (~eba) neg-plain:   来なければ【くなければ】
Provisional (~eba) neg-formal:  来ませんなら【くませんなら】
Provisional (~eba) neg-formal:  来ませんならば【くませんならば】
Potential aff-plain:   来られる【こられる】
Potential aff-plain:   来れる【これる】
Potential aff-formal:  来られます【こられます】
Potential aff-formal:  来れます【これます】
Potential neg-plain:   来られない【こられない】
Potential neg-plain:   来れない【これない】
Potential neg-formal:  来られません【こられません】
Potential neg-formal:  来れません【これません】
Passive aff-plain:   来られる【こられる】
Passive aff-formal:  来られます【こられます】
Passive neg-plain:   来られない【こられない】
Passive neg-formal:  来られません【こられません】
Causative aff-plain:   来させる【こさせる】
Causative aff-plain:   来さす【こさす】
Causative aff-formal:  来させます【こさせます】
Causative aff-formal:  来さします【こさします】
Causative neg-plain:   来させない【こさせない】
Causative neg-plain:   来ささない【こささない】
Causative neg-formal:  来させません【こさせません】
Causative neg-formal:  来さしません【こさしません】
Causative-Passive  aff-plain:   来させられる【こさせられる】
Causative-Passive  aff-formal:  来させられます【こさせられます】
Causative-Passive  neg-plain:   来させられない【こさせられない】
Causative-Passive  neg-formal:  来させられません【こさせられません】
Volitional aff-plain:   来よう【こよう】
Volitional aff-formal:  来ましょう【きましょう】
Volitional neg-plain:   来まい【こまい】
Volitional neg-formal:  来ますまい【きますまい】
Imperative aff-plain:   来い【こい】
Imperative aff-formal:  来なさい【こなさい】
Imperative neg-plain:   来るな【くるな】
Imperative neg-formal:  来なさるな【こなさるな】
Conditional (~tara) aff-plain:   来たら【きたら】
Conditional (~tara) aff-formal:  来ましたら【きましたら】
Conditional (~tara) neg-plain:   来なかったら【こなかったら】
Conditional (~tara) neg-formal:  来ませんでしたら【きませんでしたら】
Alternative (~tari) aff-plain:   来たり【きたり】
Alternative (~tari) aff-formal:  来ましたり【きましたり】
Alternative (~tari) neg-plain:   来なかったり【こなかったり】
Alternative (~tari) neg-formal:  来ませんでしたり【きませんでしたり】
Continuative (~i) aff-plain:   来【き】
```
