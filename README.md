jconj-js
==========
TS/JS port of a table-based Japanese word conjugator (https://github.com/yamagoya/jconj)

```
jconv-js Copyright (c) 2018 cobysy
Original Python Script: Copyright (c) 2014,2018 Stuart McGraw
```

My first piece of TS/JS/Node code.

You can see how jconj works in [demo site](https://cobysy.github.io/jconj/).


Demo usage
----------

```
gulp demo
```

Output
```
Non-past aff-plain:   来る【くる】
Non-past aff-formal:  来ます【きます】
Non-past neg-plain:   来ない【こない】
Non-past neg-formal:  来ません【きません】
Imperative aff-plain:   来い【こい】[1]
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
Past (~ta) aff-plain:   来た【きた】
Past (~ta) aff-formal:  来ました【きました】
Past (~ta) neg-plain:   来なかった【こなかった】
Past (~ta) neg-formal:  来ませんでした【きませんでした】
Conjunctive (~te) aff-plain:   来て【きて】
Conjunctive (~te) aff-formal:  来まして【きまして】
Conjunctive (~te) neg-plain:   来なくて【こなくて】 / 来ないで【こないで】
Conjunctive (~te) neg-formal:  来ませんで【きませんで】
Provisional (~eba) aff-plain:   来れば【くれば】
Provisional (~eba) aff-formal:  来ますなら【くますなら】 / 来ますならば【くますならば】
Provisional (~eba) neg-plain:   来なければ【くなければ】
Provisional (~eba) neg-formal:  来ませんなら【くませんなら】 / 来ませんならば【くませんならば】
Potential aff-plain:   来られる【こられる】 / 来れる【これる】[6]
Potential aff-formal:  来られます【こられます】 / 来れます【これます】[6]
Potential neg-plain:   来られない【こられない】 / 来れない【これない】[6]
Potential neg-formal:  来られません【こられません】 / 来れません【これません】[6]
Passive aff-plain:   来られる【こられる】
Passive aff-formal:  来られます【こられます】
Passive neg-plain:   来られない【こられない】
Passive neg-formal:  来られません【こられません】
Causative aff-plain:   来させる【こさせる】 / 来さす【こさす】
Causative aff-formal:  来させます【こさせます】 / 来さします【こさします】
Causative neg-plain:   来させない【こさせない】 / 来ささない【こささない】
Causative neg-formal:  来させません【こさせません】 / 来さしません【こさしません】
Causative-Passive  aff-plain:   来させられる【こさせられる】
Causative-Passive  aff-formal:  来させられます【こさせられます】
Causative-Passive  neg-plain:   来させられない【こさせられない】
Causative-Passive  neg-formal:  来させられません【こさせられません】
Volitional aff-plain:   来よう【こよう】
Volitional aff-formal:  来ましょう【きましょう】
Volitional neg-plain:   来まい【こまい】[5]
Volitional neg-formal:  来ますまい【きますまい】[5]
Notes:
[1] -- Irregular conjugation.  Note that this not the same as the definition of "irregular verb"" commonly found in textbooks (typically する d 来る).  It denotes okurigana that is different than other words of the same class.  Thus the past tense of 行く (行った) is an irregular conjugation because other く (v5k) verbs use いた as the okurigana for this conjugation.  します is not an irregular conjugation because if we take する to behave as a v1 verb the okurigana is the same as other v1 verbs despite the sound change of the stem (す) part of the verb to し.
[5] -- The -まい negative form is literary and rather rare.
[6] -- The ら is sometimes dropped from -られる, etc. in the potential form in conversational Japanese, but it is not regarded as grammatically correct.
```


## Gulp builds

Conjugation tables to JSON
```
gulp build-conjtables
```

