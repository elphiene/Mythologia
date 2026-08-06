import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  PALETTE — celestial chart: myths end as constellations              */
/* ------------------------------------------------------------------ */
const C = {
  void: "#0a0f1e",
  panel: "#101830",
  panelSoft: "#161f3c",
  rule: "#26325c",
  star: "#e8edff",
  muted: "#8290bb",
  faint: "#5a668f",
  titan: "#a98ae0",
  god: "#e8c46a",
  hero: "#e58a58",
  mortal: "#c9bda4",
  monster: "#8fbf7a",
  event: "#63cfc0",
  place: "#7aa8e8",
};

const TYPE_LABEL = {
  titan: "Titan",
  god: "God",
  hero: "Hero",
  mortal: "Mortal",
  monster: "Creature",
  event: "Story",
  place: "Place",
};

const EDGE_STYLE = {
  blood: { color: "#5f6d9c", w: 1.1, dash: null, label: "Parent to child" },
  descent: { color: "#5f6d9c", w: 1.1, dash: "2 5", label: "Generations later" },
  union: { color: "#e8c46a", w: 1.1, dash: "6 4", label: "Marriage or affair" },
  part: { color: "#3f7d78", w: 1, dash: null, label: "Appears in story" },
  cause: { color: "#e58a58", w: 1.6, dash: null, label: "Leads directly to" },
  crossover: { color: "#e0607a", w: 1.5, dash: "1 5", label: "Crosses the timeline" },
};

const ERAS = [
  { n: "I", name: "Before the World", y0: 20, y1: 355 },
  { n: "II", name: "The First Humans", y0: 385, y1: 725 },
  { n: "III", name: "Founders & First Heroes", y0: 755, y1: 1160 },
  { n: "IV", name: "The Heroic Age", y0: 1190, y1: 1700 },
  { n: "V", name: "The Road to Troy", y0: 1730, y1: 2140 },
  { n: "VI", name: "The Trojan War", y0: 2170, y1: 2510 },
  { n: "VII", name: "The Returns", y0: 2540, y1: 2910 },
];

const W = 1960;
const H = 2960;

/* ------------------------------------------------------------------ */
/*  NODES                                                              */
/*  story text supports [[id|Display]] inline links                    */
/* ------------------------------------------------------------------ */
const NODES = [
  /* ---------- ERA I ---------- */
  { id: "titans", name: "The Titans", type: "titan", x: 120, y: 110, era: 0,
    story: "The second generation of divine beings, children of Gaia (Earth) and Uranus (Sky). [[cronus|Cronus]] led them after castrating his father. Most were imprisoned in Tartarus after losing the war with the Olympians — but not all: [[prometheus|Prometheus]] and [[epimetheus|Epimetheus]] backed the winning side, which is why they remain free to shape the human story afterwards." },
  { id: "cronus", name: "Cronus", type: "titan", x: 120, y: 235, era: 0,
    story: "Warned that his own child would overthrow him — exactly as he overthrew his father — Cronus swallowed each of his children at birth. His wife Rhea hid the youngest, [[zeus|Zeus]], and fed Cronus a stone instead. Zeus grew up, forced him to disgorge his siblings, and the [[titanomachy|war]] began. Note the pattern: three generations in a row, sons destroy fathers." },
  { id: "titanomachy", name: "The Titanomachy", type: "event", x: 310, y: 110, era: 0,
    story: "A ten-year war between the [[titans|Titans]] and the children of [[cronus|Cronus]]. [[zeus|Zeus]] freed the Cyclopes and Hundred-Handers from Tartarus; in gratitude they forged his thunderbolt, Poseidon's trident and Hades' helm of invisibility. The Titans lost and were imprisoned. This is the founding act of Olympian rule — everything after it happens under Zeus's order." },
  { id: "cosmosdivision", name: "Dividing the Cosmos", type: "event", x: 310, y: 265, era: 0,
    story: "The three victorious brothers drew lots for the universe. [[zeus|Zeus]] took the sky, [[poseidon|Poseidon]] the sea, [[hades|Hades]] the underworld. Earth was left as shared ground — which is precisely why gods keep meddling in mortal affairs there. Hades' share is the reason he is almost never on Olympus and almost never in other myths." },
  { id: "zeus", name: "Zeus", type: "god", x: 490, y: 95, era: 0,
    story: "King of the gods, ruler of the sky, and the single most connected figure on this map. His affairs with mortal women produce a huge share of the heroic bloodlines: [[perseus|Perseus]], [[heracles|Heracles]], [[helen|Helen]], [[polydeuces|Polydeuces]], [[dionysus|Dionysus]]. He also punishes: [[prometheusbound|Prometheus]], [[pandorasjar|humanity]], and [[theflood|the entire human race]] in turn." },
  { id: "poseidon", name: "Poseidon", type: "god", x: 490, y: 195, era: 0,
    story: "God of the sea, earthquakes and horses. He loses the [[athenscontest|contest for Athens]] to [[athena|Athena]] and never quite forgives the city. He is a second father to [[theseus|Theseus]] in some versions, and his grudge against [[odysseus|Odysseus]] for blinding his son Polyphemus is the engine of the whole [[odyssey|Odyssey]]." },
  { id: "hades", name: "Hades", type: "god", x: 490, y: 295, era: 0,
    story: "Lord of the dead — a role, not a punishment. He rarely leaves his realm, which is why he appears in so few myths. The two big exceptions are his [[persephonemyth|abduction of Persephone]] and the mortals who come down to him: [[heracles|Heracles]] for Cerberus, and [[underworldraid|Theseus and Pirithous]], who came to steal his wife and were caught." },
  { id: "hera", name: "Hera", type: "god", x: 645, y: 60, era: 0,
    story: "Wife and sister of [[zeus|Zeus]], goddess of marriage — and therefore permanently enraged by his affairs. Her jealousy is a direct cause of the [[labors|Twelve Labours]], since she drove [[heracles|Heracles]] to the madness he spent the rest of his life atoning for. She also loses the [[judgmentparis|Judgment of Paris]], which turns her against Troy for the entire war." },
  { id: "demeter", name: "Demeter", type: "god", x: 645, y: 165, era: 0,
    story: "Goddess of grain and harvest. When [[hades|Hades]] took her daughter [[persephone|Persephone]], she let the whole world go barren until she got her back. Her grief has one strange side effect much later: distracted at [[tantalusfeast|Tantalus's feast]], she is the only god who fails to notice what is on the plate." },
  { id: "persephone", name: "Persephone", type: "god", x: 795, y: 235, era: 0,
    story: "Daughter of [[zeus|Zeus]] and [[demeter|Demeter]], queen of the underworld. She is both victim and sovereign — later myths show her ruling with real authority, granting Orpheus his one chance and refusing [[underworldraid|Pirithous]] flatly. Her half-and-half year is the Greek explanation for the seasons." },
  { id: "persephonemyth", name: "The Abduction of Persephone", type: "event", x: 645, y: 305, era: 0,
    story: "[[hades|Hades]] carried [[persephone|Persephone]] into the earth with [[zeus|Zeus]]'s quiet consent. [[demeter|Demeter]] searched, refused to let anything grow, and forced a settlement — but Persephone had eaten pomegranate seeds in the underworld, binding her to it for part of every year. This myth sits slightly outside the timeline: it is cyclical, repeating forever, rather than an event that leads to the next thing." },
  { id: "athena", name: "Athena", type: "god", x: 965, y: 60, era: 0,
    story: "Goddess of wisdom, craft and strategic war, born from [[zeus|Zeus]]'s head. She wins [[athenscontest|Athens]], helps [[mankindclay|breathe life]] into the first humans, arms [[medusaquest|Perseus]] against Medusa, and backs [[odysseus|Odysseus]] throughout. She loses the [[judgmentparis|Judgment of Paris]] and spends the war against Troy — then turns on the Greeks too during the [[nostoi|voyages home]]." },
  { id: "aphrodite", name: "Aphrodite", type: "god", x: 965, y: 165, era: 0,
    story: "Goddess of desire. She wins the [[judgmentparis|Judgment of Paris]] by bribing the judge with [[helen|Helen]] — a promise that starts a ten-year war. She is also the mother of [[aeneas|Aeneas]], which is why the one Trojan who escapes the sack is the one with a goddess protecting him." },
  { id: "ares", name: "Ares", type: "god", x: 1120, y: 60, era: 0,
    story: "God of slaughter and battle-frenzy, largely disliked by the other gods. His main structural role is small but load-bearing: the dragon [[thebesfounding|Cadmus kills]] at the spring of Thebes was his, and the marriage that settles that debt is his daughter [[harmonia|Harmonia]]'s." },
  { id: "hephaestus", name: "Hephaestus", type: "god", x: 1120, y: 165, era: 0,
    story: "Smith of the gods, lame and cast out of Olympus by [[hera|Hera]]. He makes the things that drive plots: the chains that hold [[prometheusbound|Prometheus]], [[pandora|Pandora]] herself out of clay, and later the shield of [[achilles|Achilles]]." },
  { id: "eris", name: "Eris", type: "god", x: 1285, y: 95, era: 0,
    story: "Goddess of strife, and the most consequential party guest in Greek myth. Left off the invitation list for the [[peleusthetiswedding|wedding of Peleus and Thetis]], she threw a [[goldenapple|golden apple]] into the hall inscribed 'to the fairest'. Everything from the [[judgmentparis|Judgment of Paris]] to the fall of Troy unrolls from that one act of spite." },

  /* ---------- ERA II ---------- */
  { id: "prometheus", name: "Prometheus", type: "titan", x: 145, y: 455, era: 1,
    story: "A [[titans|Titan]] whose name means 'forethought'. He sided with [[zeus|Zeus]] in the [[titanomachy|war]], then spent the rest of his existence undermining him on humanity's behalf: [[mankindclay|shaping mortals from clay]], [[sacrificetrick|cheating Zeus at the first sacrifice]], and [[theftoffire|stealing fire]]. He also holds the one secret Zeus needs — the prophecy about [[thetis|Thetis]] — and trades it for freedom." },
  { id: "epimetheus", name: "Epimetheus", type: "titan", x: 145, y: 595, era: 1,
    story: "Prometheus's brother, whose name means 'afterthought' — the joke is the whole character. Given the job of handing out useful traits to living creatures, he spent them all on animals and left humans naked and defenceless. Warned never to accept a gift from [[zeus|Zeus]], he accepted [[pandora|Pandora]] anyway. Their daughter is [[pyrrha|Pyrrha]]." },
  { id: "mankindclay", name: "Prometheus Shapes Mankind", type: "event", x: 325, y: 425, era: 1,
    story: "[[prometheus|Prometheus]] moulds the first men from clay and river water, and [[athena|Athena]] breathes life into them. Because [[epimetheus|Epimetheus]] had already given away every natural advantage, humans arrive with no fur, claws or speed — the deficit that makes [[theftoffire|fire]] necessary and makes Prometheus their permanent advocate." },
  { id: "sacrificetrick", name: "The Trick at Mecone", type: "event", x: 325, y: 525, era: 1,
    story: "At the first sacrifice, [[prometheus|Prometheus]] made two piles: bones hidden under glistening fat, and good meat hidden under an unappetising hide. [[zeus|Zeus]] chose the fat and got bones — which is why Greek ritual burns bones and fat for the gods while people eat the meat. It is an origin story for sacrifice, and the insult that makes Zeus withhold [[theftoffire|fire]]." },
  { id: "theftoffire", name: "The Theft of Fire", type: "event", x: 325, y: 625, era: 1,
    story: "Denied fire after [[sacrificetrick|the trick at Mecone]], [[prometheus|Prometheus]] smuggled it out of Olympus in a hollow fennel stalk. Fire means cooking, metal, craft — civilisation. [[zeus|Zeus]] answers with two punishments running in parallel: [[prometheusbound|one for Prometheus]] and [[pandorasjar|one for humanity]]." },
  { id: "prometheusbound", name: "Prometheus Bound", type: "event", x: 495, y: 665, era: 1,
    story: "[[prometheus|Prometheus]] is chained to a crag in the Caucasus while an eagle eats his liver daily; being immortal, it grows back each night. Generations later [[heracles|Heracles]] passes by on his labours, shoots the eagle and frees him — one of the longest reaches on this whole map, a hero from the Heroic Age closing a wound from before humans existed." },
  { id: "pandora", name: "Pandora", type: "mortal", x: 495, y: 525, era: 1,
    story: "The first woman, made by [[hephaestus|Hephaestus]] on [[zeus|Zeus]]'s orders and given a gift by every god — her name means 'all-gifted'. She was sent as a beautiful punishment to [[epimetheus|Epimetheus]], who accepted her against his brother's warning. Her daughter [[pyrrha|Pyrrha]] survives the flood and helps restart the human race." },
  { id: "pandorasjar", name: "Pandora's Jar", type: "event", x: 665, y: 455, era: 1,
    story: "[[pandora|Pandora]] opens the great storage jar — a pithos, not a box; 'box' is a Renaissance mistranslation — and every sickness, toil and sorrow escapes into the world. Only Hope is left inside when she gets the lid back on, and scholars still argue whether that means humanity keeps hope or is denied it. This is Zeus's answer to [[theftoffire|the theft of fire]]." },
  { id: "theflood", name: "Zeus's Flood", type: "event", x: 865, y: 435, era: 1,
    story: "[[zeus|Zeus]] decides the current race of humans is irredeemably corrupt and drowns the world. Forewarned by his father [[prometheus|Prometheus]], [[deucalion|Deucalion]] builds a chest and rides out the water with his wife [[pyrrha|Pyrrha]], landing on Parnassus. It is a hard reset: the humans of the Heroic Age all descend from these two." },
  { id: "deucalion", name: "Deucalion", type: "mortal", x: 705, y: 625, era: 1,
    story: "Son of [[prometheus|Prometheus]], and the Greek Noah. He survives [[theflood|the flood]] with his wife and cousin [[pyrrha|Pyrrha]]. Notice the symmetry: the flood is survived by the son of the fire-thief and the daughter of the first woman — the two halves of Zeus's original punishment, married." },
  { id: "pyrrha", name: "Pyrrha", type: "mortal", x: 865, y: 625, era: 1,
    story: "Daughter of [[epimetheus|Epimetheus]] and [[pandora|Pandora]], wife of [[deucalion|Deucalion]]. Together they survive [[theflood|the flood]] and repopulate the earth by [[stonesmen|throwing stones]]. Their son [[hellen|Hellen]] gives the Greeks their name for themselves." },
  { id: "stonesmen", name: "The Men of Stone", type: "event", x: 1035, y: 545, era: 1,
    story: "Told by an oracle to throw 'the bones of their mother' over their shoulders, [[deucalion|Deucalion]] and [[pyrrha|Pyrrha]] work out that the mother is Gaia — the earth — and her bones are stones. His stones become men, hers become women. The new race is literally hard, born of rock, which the Greeks read as an explanation for human toughness." },
  { id: "hellen", name: "Hellen", type: "mortal", x: 1155, y: 625, era: 1,
    story: "Son of [[deucalion|Deucalion]] and [[pyrrha|Pyrrha]], and the ancestor the Greeks named themselves after — Hellenes, hence Hellenic. Not to be confused with [[helen|Helen of Troy]], a different name entirely in Greek. His sons give their names to the main Greek peoples, turning genealogy into a map of who lives where." },
  { id: "dorus", name: "Dorus", type: "mortal", x: 1325, y: 535, era: 1,
    story: "Son of [[hellen|Hellen]] and eponymous ancestor of the Dorians — the Greeks of Sparta, Corinth and Crete. These 'tribal ancestor' figures have no stories of their own; they exist to explain why a Spartan and an Athenian are cousins who cannot stand each other." },
  { id: "aeolus", name: "Aeolus", type: "mortal", x: 1325, y: 635, era: 1,
    story: "Son of [[hellen|Hellen]] and ancestor of the Aeolians of Thessaly and Boeotia. Confusingly, a different Aeolus is the keeper of the winds who gives [[odysseus|Odysseus]] a bag of storms — Greek myth reuses names constantly, and this is one of the traps in it." },
  { id: "xuthus", name: "Xuthus", type: "mortal", x: 1480, y: 585, era: 1,
    story: "Son of [[hellen|Hellen]] and father of Ion and Achaeus — ancestors of the Ionians (Athens, the islands) and the Achaeans. 'Achaeans' is the word Homer actually uses for the Greeks at [[trojanwar|Troy]], so this obscure figure is the reason the Iliad calls them that." },

  /* ---------- ERA III ---------- */
  { id: "cecrops", name: "Cecrops", type: "mortal", x: 130, y: 835, era: 2,
    story: "The first king of Attica, born from the earth with a serpent's tail instead of legs. He judged the [[athenscontest|contest]] between [[athena|Athena]] and [[poseidon|Poseidon]] and is credited with founding marriage, writing and burial — the institutions that make a city a city rather than a settlement." },
  { id: "athenscontest", name: "The Contest for Athens", type: "event", x: 130, y: 955, era: 2,
    story: "[[athena|Athena]] and [[poseidon|Poseidon]] competed for the city's patronage. Poseidon struck the rock and produced a salt spring (in some versions, the first horse); Athena planted an olive tree. The olive — food, oil, lamplight, trade — won, and the city took her name. Poseidon's resentment lingers in Athenian myth ever after." },
  { id: "athens", name: "Athens", type: "place", x: 130, y: 1075, era: 2,
    story: "Named for [[athena|Athena]] after the [[athenscontest|contest]], and unified into a single state by [[atticaunion|Theseus]]. In the myths it becomes the place where things get resolved rather than avenged — most importantly at the trial that ends the [[orestesrevenge|curse on the House of Atreus]]. That is Athens telling its own story about law replacing vendetta." },
  { id: "europa", name: "Europa", type: "mortal", x: 330, y: 805, era: 2,
    story: "A Phoenician princess, sister of [[cadmus|Cadmus]]. [[zeus|Zeus]] took the form of a white bull, carried her across the sea to Crete, and fathered Minos — whose wife later bears the [[minotaur|Minotaur]]. She gives her name to the continent of Europe, and her disappearance is what sends Cadmus westward to [[thebesfounding|found Thebes]]." },
  { id: "cadmus", name: "Cadmus", type: "mortal", x: 330, y: 905, era: 2,
    story: "Phoenician prince sent to find his sister [[europa|Europa]] and forbidden to return without her. He never finds her, consults Delphi instead, and [[thebesfounding|founds Thebes]]. Greek tradition also credits him with bringing the alphabet to Greece. His line runs straight down to [[laius|Laius]] and [[oedipus|Oedipus]]." },
  { id: "thebesfounding", name: "The Sown Men", type: "event", x: 330, y: 1025, era: 2,
    story: "Told to follow a cow and build where it lay down, [[cadmus|Cadmus]] founded [[thebes|Thebes]] — then killed a dragon sacred to [[ares|Ares]] that guarded the spring. On [[athena|Athena]]'s advice he sowed its teeth; armed men sprang up and fought until five remained, and those five became Thebes's noble houses. A city founded on a killing and on men who came out of the ground fighting: Thebes is doomed from the first day." },
  { id: "harmonia", name: "Harmonia", type: "mortal", x: 490, y: 905, era: 2,
    story: "Daughter of [[ares|Ares]] and [[aphrodite|Aphrodite]], given to [[cadmus|Cadmus]] as a bride — compensation for the dragon he killed. Their wedding was attended by all the gods. Her necklace, made by [[hephaestus|Hephaestus]], is cursed and brings ruin to every woman who wears it, resurfacing generations later to help destroy [[seventhebes|Thebes]]." },
  { id: "thebes", name: "Thebes", type: "place", x: 490, y: 1035, era: 2,
    story: "Founded by [[cadmus|Cadmus]], and the setting for the darkest cycle in Greek myth: [[oedipusmyth|Oedipus]], the [[seventhebes|Seven]], the [[epigoni|Epigoni]]. If Athens is where things get judged, Thebes is where things get repeated. It is the city Athenian tragedy uses to think about everything that could go wrong with a family and a state." },
  { id: "semele", name: "Semele", type: "mortal", x: 490, y: 795, era: 2,
    story: "Daughter of [[cadmus|Cadmus]], loved by [[zeus|Zeus]]. [[hera|Hera]], disguised, goaded her into demanding that Zeus appear in his true form; the sight incinerated her. Zeus saved the unborn [[dionysus|Dionysus]] by sewing him into his own thigh until term — which is why Dionysus is the god who was born twice." },
  { id: "dionysus", name: "Dionysus", type: "god", x: 650, y: 795, era: 2,
    story: "God of wine, theatre and ecstatic release, son of [[zeus|Zeus]] and the mortal [[semele|Semele]]. His myths are about what happens to cities that refuse him — his cousin [[pentheus|Pentheus]] most of all. He also turns up on Naxos to marry [[ariadne|Ariadne]] after [[theseus|Theseus]] abandons her, quietly stitching the Theban and Athenian threads together." },
  { id: "pentheus", name: "Pentheus", type: "mortal", x: 650, y: 905, era: 2,
    story: "King of [[thebes|Thebes]], grandson of [[cadmus|Cadmus]], and cousin of [[dionysus|Dionysus]]. He banned the new god's worship and spied on his rites; the frenzied women tore him apart, his own mother Agave leading them and carrying his head home believing it was a lion's. Euripides' Bacchae is the version everyone reads." },
  { id: "acrisius", name: "Acrisius", type: "mortal", x: 800, y: 805, era: 2,
    story: "King of Argos, told by an oracle that his daughter's son would kill him. He locked [[danae|Danaë]] in a bronze chamber; [[zeus|Zeus]] reached her as a shower of gold anyway. He then set mother and infant [[perseus|Perseus]] adrift in a chest at sea — and was killed by that grandson decades later, by accident, exactly as foretold." },
  { id: "danae", name: "Danaë", type: "mortal", x: 800, y: 905, era: 2,
    story: "Daughter of [[acrisius|Acrisius]], mother of [[perseus|Perseus]] by [[zeus|Zeus]]. Cast adrift and washed up on Seriphos, she was pursued by its king Polydectes — who sent her son after [[medusaquest|Medusa's head]] specifically hoping he would not come back." },
  { id: "perseus", name: "Perseus", type: "hero", x: 950, y: 955, era: 2,
    story: "Son of [[zeus|Zeus]] and [[danae|Danaë]], and the cleanest hero story in Greek myth — he completes his quest, rescues [[andromeda|Andromeda]], marries her, rules well and dies old. He founds Mycenae, and his line produces [[heracles|Heracles]] a few generations on. Much later the [[atreus|House of Atreus]] takes Mycenae from his descendants." },
  { id: "medusaquest", name: "Perseus and Medusa", type: "event", x: 1110, y: 875, era: 2,
    story: "Equipped by the gods — [[athena|Athena]]'s mirrored shield, Hermes' winged sandals, [[hades|Hades]]' cap of invisibility — [[perseus|Perseus]] beheaded [[medusa|Medusa]] by watching her reflection. Flying home with the head he found [[andromeda|Andromeda]] chained to a rock as a sacrifice and saved her. He later used the head as a weapon, then gave it to Athena for her shield." },
  { id: "medusa", name: "Medusa", type: "monster", x: 1270, y: 805, era: 2,
    story: "The one mortal Gorgon, whose gaze turned people to stone. Ovid's influential version makes her a beautiful priestess of [[athena|Athena]] assaulted by [[poseidon|Poseidon]] in the goddess's own temple, and transformed as punishment — the victim blamed. From her severed neck sprang the winged horse Pegasus, later tamed by the hero Bellerophon." },
  { id: "andromeda", name: "Andromeda", type: "mortal", x: 1110, y: 1015, era: 2,
    story: "Ethiopian princess chained to a rock as a sea-monster's meal, because her mother Cassiopeia boasted of being more beautiful than the sea nymphs. [[perseus|Perseus]] saved and married her. She, Perseus, her mother and the monster all end up as constellations — one of the clearest examples of a myth being written into the sky." },
  { id: "tantalus", name: "Tantalus", type: "mortal", x: 1500, y: 815, era: 2,
    story: "A son of [[zeus|Zeus]], favoured enough to eat at the gods' table — and he repaid it by [[tantalusfeast|serving them his own son]]. His punishment gave English the word 'tantalise': standing in water that drains when he stoops, under fruit that lifts away when he reaches. He is the origin point of the [[thyesteanfeast|curse]] that eventually kills [[agamemnonmurder|Agamemnon]]." },
  { id: "tantalusfeast", name: "The Feast of Tantalus", type: "event", x: 1665, y: 815, era: 2,
    story: "[[tantalus|Tantalus]] tested the gods' omniscience by killing his son [[pelops|Pelops]], cooking him and serving him at dinner. Every god recognised it instantly and refused — except [[demeter|Demeter]], too deep in grief over [[persephone|Persephone]] to notice, who ate a shoulder. The gods restored Pelops with an ivory replacement. The crime is cannibalism against one's own child, and the family will commit it again." },
  { id: "pelops", name: "Pelops", type: "mortal", x: 1500, y: 935, era: 2,
    story: "Killed and resurrected as a child at [[tantalusfeast|his father's feast]], with an ivory shoulder where [[demeter|Demeter]] ate. He grew up to win [[hippodamia|Hippodamia]] by [[pelopsrace|cheating in a chariot race]] and murdering his accomplice. The Peloponnese — 'island of Pelops' — is named for him. His sons are [[atreus|Atreus]] and [[thyestes|Thyestes]]." },
  { id: "pelopsrace", name: "The Chariot Race", type: "event", x: 1665, y: 935, era: 2,
    story: "[[hippodamia|Hippodamia]]'s father killed every suitor who lost a chariot race to him. [[pelops|Pelops]] bribed the king's charioteer Myrtilus to replace the linchpins with wax; the king died in the crash. Pelops then threw Myrtilus into the sea to avoid paying — and Myrtilus's dying curse is the one that actually damns the family. Every later horror in this line traces back to this broken promise." },
  { id: "hippodamia", name: "Hippodamia", type: "mortal", x: 1500, y: 1055, era: 2,
    story: "Won by [[pelops|Pelops]] through [[pelopsrace|sabotage and murder]]. Mother of [[atreus|Atreus]] and [[thyestes|Thyestes]] — and in some versions she pushes them into killing their half-brother Chrysippus, which gets the whole family exiled to Mycenae and sets the feud in motion." },

  /* ---------- ERA IV ---------- */
  { id: "ariadne", name: "Ariadne", type: "mortal", x: 140, y: 1365, era: 3,
    story: "Cretan princess, half-sister of the [[minotaur|Minotaur]]. She gave [[theseus|Theseus]] the thread that let him find his way back out of the labyrinth, then fled with him — and he abandoned her sleeping on Naxos. [[dionysus|Dionysus]] found her there and married her; her wedding crown became a constellation. She is rescued from an Athenian hero by a Theban god." },
  { id: "minotaur", name: "The Minotaur", type: "monster", x: 140, y: 1485, era: 3,
    story: "Bull-headed son of Minos's wife Pasiphaë, born after [[poseidon|Poseidon]] cursed her with desire for a bull. Minos hid it in Daedalus's labyrinth and fed it Athenian children as tribute — the tribute [[minotaurmyth|Theseus]] volunteered for. Minos, note, is a son of [[europa|Europa]]: the Cretan and Theban lines are cousins." },
  { id: "aegeus", name: "Aegeus", type: "mortal", x: 300, y: 1255, era: 3,
    story: "King of [[athens|Athens]] and mortal father of [[theseus|Theseus]]. He watched daily for his son's ship returning from Crete; when it came back still flying the black sail [[minotaurmyth|Theseus forgot to change]], he threw himself into the sea. The Aegean is named for him — a whole sea named after a signalling error." },
  { id: "theseus", name: "Theseus", type: "hero", x: 300, y: 1375, era: 3,
    story: "The Athenian national hero: son of [[aegeus|Aegeus]] and, in some tellings, [[poseidon|Poseidon]] as well. He kills the [[minotaur|Minotaur]], [[atticaunion|unifies Attica]] under Athens, abandons [[ariadne|Ariadne]], abducts a young [[helen|Helen]] before the war and is punished for it by [[dioscuri|her brothers]], and is finally trapped in the underworld on [[underworldraid|a truly stupid errand]] until [[heracles|Heracles]] pulls him out." },
  { id: "minotaurmyth", name: "Theseus and the Minotaur", type: "event", x: 300, y: 1495, era: 3,
    story: "[[theseus|Theseus]] volunteered among the Athenian youths sent as tribute to Crete, killed the [[minotaur|Minotaur]] in the labyrinth and escaped using [[ariadne|Ariadne]]'s thread. On the way home he abandoned her on Naxos and forgot to swap the black sail for white — killing [[aegeus|his father]] and inheriting the throne on the same day." },
  { id: "atticaunion", name: "The Unification of Attica", type: "event", x: 465, y: 1255, era: 3,
    story: "[[theseus|Theseus]]'s least dramatic and most important act: merging the scattered towns of Attica into a single state governed from [[athens|Athens]]. Athenians told this story to give their democracy a heroic founder. It is the moment a myth stops being an adventure and starts being a constitution." },
  { id: "underworldraid", name: "The Raid on the Underworld", type: "event", x: 300, y: 1615, era: 3,
    story: "[[theseus|Theseus]] and his friend Pirithous swore to marry daughters of [[zeus|Zeus]] — so they abducted the child [[helen|Helen]], then went down to take [[persephone|Persephone]] from [[hades|Hades]] himself. Hades offered them seats which fused to their flesh. [[heracles|Heracles]], down for Cerberus, tore Theseus free; Pirithous stayed forever. The Helen abduction is why [[dioscuri|her brothers]] later sack Athens." },
  { id: "laius", name: "Laius", type: "mortal", x: 620, y: 1255, era: 3,
    story: "King of [[thebes|Thebes]], descendant of [[cadmus|Cadmus]]. Warned that his own son would kill him, he pierced the infant's ankles and left him to die on a mountain. The child survived and became [[oedipus|Oedipus]]. Laius met him years later at a crossroads, they quarrelled over right of way, and the prophecy completed itself." },
  { id: "jocasta", name: "Jocasta", type: "mortal", x: 765, y: 1255, era: 3,
    story: "Queen of [[thebes|Thebes]], wife of [[laius|Laius]] — then wife of [[oedipus|Oedipus]], who was also her son. She works out the truth in Sophocles' play before he does, begs him to stop asking questions, and hangs herself when he will not. Her brother Creon takes the throne after [[seventhebes|her sons destroy each other]]." },
  { id: "oedipus", name: "Oedipus", type: "mortal", x: 690, y: 1375, era: 3,
    story: "Exposed as an infant by [[laius|Laius]], raised in Corinth, and told by an oracle he would kill his father and marry his mother. He fled the people he thought were his parents — straight into the prophecy. He killed a stranger at a crossroads, solved the Sphinx's riddle, and was given [[thebes|Thebes]] and its widowed queen [[jocasta|Jocasta]] as his reward." },
  { id: "oedipusmyth", name: "Oedipus at Thebes", type: "event", x: 690, y: 1495, era: 3,
    story: "A plague forces [[oedipus|Oedipus]] to hunt [[laius|Laius]]'s killer, and the investigation converges on himself. [[jocasta|Jocasta]] hangs herself; he blinds himself with her brooches and goes into exile. He curses his sons on the way out — and that curse is the direct cause of [[seventhebes|the war between them]]." },
  { id: "eteocles", name: "Eteocles", type: "mortal", x: 620, y: 1615, era: 3,
    story: "Son of [[oedipus|Oedipus]]. He and [[polynices|Polynices]] agreed to rule [[thebes|Thebes]] in alternate years; when his year ended he refused to hand over. He defended the city against [[seventhebes|the Seven]] and died at the seventh gate, killing and killed by his brother in the same exchange." },
  { id: "polynices", name: "Polynices", type: "mortal", x: 765, y: 1615, era: 3,
    story: "Son of [[oedipus|Oedipus]]. Cheated of his turn on the throne by [[eteocles|Eteocles]], he married into Argos and raised [[seventhebes|an army of seven champions]] to take Thebes by force. He and his brother killed each other; Creon then forbade his burial, which is the crisis [[antigone|Antigone]] dies over. His son joins [[epigoni|the Epigoni]] to finish the job." },
  { id: "alcmene", name: "Alcmene", type: "mortal", x: 950, y: 1255, era: 3,
    story: "Granddaughter of [[perseus|Perseus]] and mother of [[heracles|Heracles]]. [[zeus|Zeus]] came to her disguised as her own husband, holding back the dawn to make the night three times as long. Her husband arrived the following night, and she bore twins with different fathers — a mortal one and a divine one, the same pattern as [[leda|Leda]]'s children." },
  { id: "heracles", name: "Heracles", type: "hero", x: 950, y: 1375, era: 3,
    story: "Son of [[zeus|Zeus]] and [[alcmene|Alcmene]], descendant of [[perseus|Perseus]], and the hero who touches more stories than any other. Driven mad by [[hera|Hera]] into killing his own children, he performed [[labors|the Twelve Labours]] as penance. Along the way he frees [[prometheusbound|Prometheus]], hauls [[underworldraid|Theseus]] out of the underworld, and sails briefly with [[argonauts|the Argonauts]]." },
  { id: "labors", name: "The Twelve Labours", type: "event", x: 950, y: 1495, era: 3,
    story: "Penance imposed on [[heracles|Heracles]] for the children he killed in [[hera|Hera]]-sent madness. The famous twelve run from the Nemean Lion to fetching Cerberus out of [[hades|Hades]]' realm alive — the labour on which he happens to find [[underworldraid|Theseus]] fused to a stone seat and rips him loose. He frees [[prometheusbound|Prometheus]] on another." },
  { id: "heraclesdeath", name: "The Death of Heracles", type: "event", x: 950, y: 1615, era: 3,
    story: "The centaur Nessus, dying from [[heracles|Heracles]]'s arrow, told Heracles's wife Deianira that his blood was a love charm. Years later, fearing a rival, she soaked a robe in it — and the poison burned him alive. He built his own pyre. His mortal part burned away, the divine part rose to Olympus, and he married Hebe: the only hero to become a god." },
  { id: "chiron", name: "Chiron", type: "monster", x: 1085, y: 1620, era: 3,
    story: "The wise centaur, tutor to a startling number of heroes across generations — he coaches [[peleus|Peleus]] on how to hold [[thetis|Thetis]], then raises their son [[achilles|Achilles]]. Immortal, he was accidentally wounded by one of [[heracles|Heracles]]'s poisoned arrows and, unable to die or heal, traded his immortality to [[prometheusbound|free Prometheus]]." },
  { id: "jason", name: "Jason", type: "hero", x: 1250, y: 1255, era: 3,
    story: "Rightful heir of Iolcus, sent after the Golden Fleece by a usurping uncle who expected him to die trying. He succeeded only because [[medea|Medea]] fell in love with him and did the actual impossible parts. He later abandoned her for a better marriage, and she destroyed everything he had. He died alone under the rotting prow of [[argonauts|the Argo]]." },
  { id: "medea", name: "Medea", type: "mortal", x: 1410, y: 1255, era: 3,
    story: "Colchian princess, priestess of Hecate, granddaughter of the sun. She betrayed her father to help [[jason|Jason]] take the fleece, murdered her own brother to slow the pursuit, and killed for him repeatedly. When he cast her aside she killed his new bride and their two sons and escaped in a chariot drawn by dragons. Euripides refuses to let anyone punish her." },
  { id: "argonauts", name: "The Voyage of the Argo", type: "event", x: 1290, y: 1375, era: 3,
    story: "[[jason|Jason]]'s quest for the Golden Fleece, crewed by nearly every hero alive at once — [[heracles|Heracles]] (who leaves early to search for his lost companion Hylas), [[castor|Castor]] and [[polydeuces|Polydeuces]], [[peleus|Peleus]], [[telamon|Telamon]]. Read the crew list as a cast of fathers: their sons are the men who fight at [[trojanwar|Troy]] a generation later. It is the hinge between the Heroic Age and the war." },
  { id: "peleus", name: "Peleus", type: "mortal", x: 1215, y: 1495, era: 3,
    story: "An [[argonauts|Argonaut]], and the mortal the gods married [[thetis|Thetis]] off to when they learned it was too dangerous to father her child themselves. Coached by [[chiron|Chiron]], he held her through her shape-shifting — fire, water, serpent, lioness — until she yielded. Their [[peleusthetiswedding|wedding]] starts the Trojan War. Their son is [[achilles|Achilles]]." },
  { id: "telamon", name: "Telamon", type: "mortal", x: 1380, y: 1495, era: 3,
    story: "Brother of [[peleus|Peleus]] and a fellow [[argonauts|Argonaut]]; the two also sacked Troy once already, alongside [[heracles|Heracles]], a generation before the famous war. His son [[ajax|Ajax the Great]] is the strongest Greek at Troy after [[achilles|Achilles]] — making the two greatest Greek warriors first cousins." },
  { id: "thetis", name: "Thetis", type: "god", x: 1215, y: 1615, era: 3,
    story: "A sea nymph wanted by both [[zeus|Zeus]] and [[poseidon|Poseidon]] — until [[prometheus|Prometheus]] revealed the prophecy that her son would be greater than his father. Too dangerous for a god, so she was married to the mortal [[peleus|Peleus]] instead. She dipped her son [[achilles|Achilles]] in the Styx, holding the heel, and spends the Iliad trying to protect a child she knows is doomed." },
  { id: "atreus", name: "Atreus", type: "mortal", x: 1560, y: 1255, era: 3,
    story: "Son of [[pelops|Pelops]], king of Mycenae — a throne his family took from the descendants of [[perseus|Perseus]]. His brother [[thyestes|Thyestes]] seduced his wife to steal the golden lamb that decided the succession; [[zeus|Zeus]] reversed the sun's course to confirm Atreus as king. His revenge was [[thyesteanfeast|the feast]]. His sons are [[agamemnon|Agamemnon]] and [[menelaus|Menelaus]]." },
  { id: "thyestes", name: "Thyestes", type: "mortal", x: 1720, y: 1255, era: 3,
    story: "Brother and rival of [[atreus|Atreus]]. He seduced Atreus's wife and stole the throne of Mycenae, and was repaid with [[thyesteanfeast|a meal made of his own sons]]. An oracle told him that a son fathered on his own daughter would avenge him — so he did exactly that, and produced [[aegisthus|Aegisthus]]." },
  { id: "thyesteanfeast", name: "The Feast of Thyestes", type: "event", x: 1640, y: 1375, era: 3,
    story: "[[atreus|Atreus]] invited [[thyestes|Thyestes]] to a reconciliation banquet, killed his sons and served them to him — revealing the hands and heads only once he had eaten. It is [[tantalusfeast|Tantalus's crime]] repeated two generations on, and the point at which the curse stops being a punishment and becomes a family habit. [[aegisthus|Aegisthus]] is conceived specifically to answer it." },
  { id: "aegisthus", name: "Aegisthus", type: "mortal", x: 1785, y: 1495, era: 3,
    story: "Son of [[thyestes|Thyestes]] by his own daughter, conceived expressly as an instrument of revenge for [[thyesteanfeast|the feast]]. He kills [[atreus|Atreus]], and decades later becomes [[clytemnestra|Clytemnestra]]'s lover and co-conspirator in [[agamemnonmurder|the murder of Agamemnon]]. He is the reason the Trojan War ends in a family vendetta that started three generations earlier." },
  { id: "leda", name: "Leda", type: "mortal", x: 1500, y: 1615, era: 3,
    story: "Queen of Sparta, wife of [[tyndareus|Tyndareus]]. [[zeus|Zeus]] came to her as a swan, and she lay with god and husband the same night — bearing two pairs of twins with two fathers. From her come [[helen|Helen]] and [[polydeuces|Polydeuces]] (divine) and [[clytemnestra|Clytemnestra]] and [[castor|Castor]] (mortal): the cause of the Trojan War and its bloodiest aftermath, born together." },
  { id: "tyndareus", name: "Tyndareus", type: "mortal", x: 1655, y: 1615, era: 3,
    story: "King of Sparta and [[leda|Leda]]'s husband, mortal father of [[clytemnestra|Clytemnestra]] and [[castor|Castor]]. Faced with a hall full of armed suitors competing for [[helen|Helen]], he took [[odysseus|Odysseus]]'s advice and made them all [[suitorsoath|swear an oath]] — the single administrative decision that later drags all of Greece to Troy." },

  /* ---------- ERA V ---------- */
  { id: "antigone", name: "Antigone", type: "mortal", x: 240, y: 1805, era: 4,
    story: "Daughter of [[oedipus|Oedipus]]. After [[seventhebes|her brothers killed each other]], Creon gave [[eteocles|Eteocles]] a hero's burial and left [[polynices|Polynices]] to rot on pain of death. She buried him anyway and was walled up alive for it. Sophocles' play is the founding text on conscience against the state — divine law against civic law, with no comfortable answer." },
  { id: "seventhebes", name: "Seven Against Thebes", type: "event", x: 420, y: 1805, era: 4,
    story: "[[polynices|Polynices]] raised seven champions to storm [[thebes|Thebes]]'s seven gates. The seer Amphiaraus went knowing he would die, betrayed into it by his wife Eriphyle, bribed with [[harmonia|Harmonia]]'s cursed necklace. The assault failed and the brothers killed each other. Six of the Seven died — and their sons come back ten years later as [[epigoni|the Epigoni]]." },
  { id: "epigoni", name: "The Epigoni", type: "event", x: 420, y: 1925, era: 4,
    story: "'Those born after' — the sons of [[seventhebes|the fallen Seven]], who mount a second campaign ten years on and this time take [[thebes|Thebes]]. Their commanders include [[diomedes|Diomedes]] and [[alcmaeon|Alcmaeon]]. This is the connective tissue most retellings skip: the Epigoni are the same generation that then sails to [[trojanwar|Troy]], carrying one war straight into the next." },
  { id: "alcmaeon", name: "Alcmaeon", type: "mortal", x: 580, y: 1925, era: 4,
    story: "One of the [[epigoni|Epigoni]], son of the seer Amphiaraus. Under his father's dying instruction he killed his own mother Eriphyle for taking [[harmonia|the cursed necklace]] as a bribe, and was driven mad by the Furies for it. It is a dry run for [[orestesrevenge|Orestes]] — same crime, same pursuers, but no trial and no acquittal at the end." },
  { id: "diomedes", name: "Diomedes", type: "hero", x: 420, y: 2055, era: 4,
    story: "Son of Tydeus, one of [[epigoni|the Epigoni]] — and then one of the most effective Greek commanders in [[iliad|the Iliad]], where he wounds [[aphrodite|Aphrodite]] and [[ares|Ares]] in a single day with [[athena|Athena]] backing him. He is the living bridge between the Theban wars and the Trojan one. Aphrodite repays him during [[nostoi|the voyage home]]." },
  { id: "ajax", name: "Ajax the Great", type: "hero", x: 700, y: 2055, era: 4,
    story: "Son of [[telamon|Telamon]], cousin of [[achilles|Achilles]], and the largest man at Troy — the Greek line's immovable defensive wall. After Achilles dies, Ajax loses the contest for his armour to [[odysseus|Odysseus]], goes mad with humiliation, slaughters livestock believing they are his commanders, and kills himself when he recovers." },
  { id: "odysseus", name: "Odysseus", type: "hero", x: 860, y: 2055, era: 4,
    story: "King of Ithaca, the strategist. He devised [[suitorsoath|the oath]] that binds the suitors, tried to dodge the war by feigning madness, then supplied the [[trojanhorse|wooden horse]] that ends it. Blinding [[poseidon|Poseidon]]'s son costs him ten more years at sea in [[odyssey|the Odyssey]]. Even his homecoming is not the end: [[telegony|one last story]] follows." },
  { id: "achilles", name: "Achilles", type: "hero", x: 860, y: 1925, era: 4,
    story: "Son of [[peleus|Peleus]] and [[thetis|Thetis]], raised by [[chiron|Chiron]] — the fulfilment of the prophecy that Thetis's son would surpass his father. Dipped in the Styx, invulnerable but for the heel his mother gripped. Given a choice between a long obscure life and a short glorious one, he chooses glory; [[iliad|the Iliad]] is about his rage, and [[achillesdeath|Paris kills him]] before Troy falls." },
  { id: "peleusthetiswedding", name: "The Wedding of Peleus and Thetis", type: "event", x: 1030, y: 1795, era: 4,
    story: "Every god attended the marriage of [[peleus|Peleus]] and [[thetis|Thetis]] — the last great celebration where gods and mortals sat together. Every god except [[eris|Eris]], who was not invited. The whole Trojan War exists because of a guest list. It happens only because [[prometheus|Prometheus]] warned Zeus off Thetis in the first place." },
  { id: "goldenapple", name: "The Golden Apple", type: "event", x: 1030, y: 1905, era: 4,
    story: "[[eris|Eris]] rolled a golden apple into the wedding hall inscribed 'to the fairest'. [[hera|Hera]], [[athena|Athena]] and [[aphrodite|Aphrodite]] each claimed it. [[zeus|Zeus]], far too sensible to judge between his wife, his daughter and the goddess of desire, handed the decision to a mortal — [[judgmentparis|a shepherd on Mount Ida]]." },
  { id: "judgmentparis", name: "The Judgment of Paris", type: "event", x: 1030, y: 2015, era: 4,
    story: "Each goddess bribed the judge: [[hera|Hera]] offered power over Asia, [[athena|Athena]] offered victory in war, [[aphrodite|Aphrodite]] offered the most beautiful woman alive. [[paris|Paris]] chose Aphrodite — and the woman was [[helen|Helen]], already married to [[menelaus|Menelaus]]. Two goddesses spend the next ten years working for Troy's destruction." },
  { id: "paris", name: "Paris", type: "mortal", x: 1190, y: 2015, era: 4,
    story: "Prince of Troy, son of [[priam|Priam]], exposed at birth after a prophecy that he would burn the city — and raised as a shepherd, which is why he is on a mountainside to [[judgmentparis|judge three goddesses]]. He takes [[helen|Helen]] from Sparta and triggers the war. He is a poor fighter but a superb archer, and he kills [[achillesdeath|Achilles]]." },
  { id: "helen", name: "Helen", type: "mortal", x: 1300, y: 1805, era: 4,
    story: "Daughter of [[zeus|Zeus]] and [[leda|Leda]], the most beautiful woman alive, and the prize [[aphrodite|Aphrodite]] promised away without asking her. Abducted as a child by [[theseus|Theseus]] and recovered by [[dioscuri|her brothers]]; married to [[menelaus|Menelaus]] under [[suitorsoath|the oath]]; taken to Troy by [[paris|Paris]]. Ancient authors could never agree whether she went willingly." },
  { id: "clytemnestra", name: "Clytemnestra", type: "mortal", x: 1450, y: 1805, era: 4,
    story: "Daughter of [[leda|Leda]] and [[tyndareus|Tyndareus]], full sister of [[castor|Castor]], half-sister of [[helen|Helen]]. Married to [[agamemnon|Agamemnon]], who [[aulis|sacrificed their daughter]] for a favourable wind. She waited ten years, took [[aegisthus|Aegisthus]] as her lover, and [[agamemnonmurder|killed her husband]] the day he came home. Her son [[orestes|Orestes]] then kills her." },
  { id: "polydeuces", name: "Polydeuces (Pollux)", type: "mortal", x: 1300, y: 1915, era: 4,
    story: "Immortal son of [[zeus|Zeus]] and [[leda|Leda]], twin to the mortal [[castor|Castor]] and full brother of [[helen|Helen]]. A champion boxer, an [[argonauts|Argonaut]], and the one who refuses to be a god alone when [[dioscuri|his brother dies]]." },
  { id: "castor", name: "Castor", type: "mortal", x: 1450, y: 1915, era: 4,
    story: "Mortal son of [[tyndareus|Tyndareus]] and [[leda|Leda]], twin to [[polydeuces|Polydeuces]] and full brother of [[clytemnestra|Clytemnestra]]. A horseman and an [[argonauts|Argonaut]]. He is killed in a cattle raid — and [[dioscuri|his death]] is the reason the twins end up in the sky." },
  { id: "dioscuri", name: "The Dioscuri", type: "event", x: 1375, y: 2035, era: 4,
    story: "When [[castor|Castor]] was killed, [[polydeuces|Polydeuces]] begged [[zeus|Zeus]] to let him share his immortality rather than lose his twin. They now alternate — one day on Olympus, one in the underworld — and appear as the constellation Gemini. Earlier they had sacked Athens to recover their sister [[helen|Helen]] after [[theseus|Theseus]] abducted her." },
  { id: "agamemnon", name: "Agamemnon", type: "hero", x: 1620, y: 1805, era: 4,
    story: "Son of [[atreus|Atreus]], king of Mycenae, commander of the Greek coalition — and heir to a house already built on [[thyesteanfeast|child-murder]] before he is born. He [[aulis|sacrifices his daughter]] to sail, quarrels with [[achilles|Achilles]] over a prize in [[iliad|the Iliad]], wins the war, and is [[agamemnonmurder|murdered in his own bath]] within a day of getting home." },
  { id: "menelaus", name: "Menelaus", type: "hero", x: 1780, y: 1805, era: 4,
    story: "Son of [[atreus|Atreus]], king of Sparta, and [[helen|Helen]]'s husband — the wronged party the whole war is nominally about. He is the one man in the House of Atreus who gets a soft ending: after eight years blown off course to Egypt in [[nostoi|the returns]], he reaches home with Helen and lives out his life." },
  { id: "suitorsoath", name: "The Oath of the Suitors", type: "event", x: 1700, y: 1925, era: 4,
    story: "Every king in Greece came courting [[helen|Helen]], and [[tyndareus|Tyndareus]] feared the losers would go to war. On [[odysseus|Odysseus]]'s advice he made all of them swear to defend whichever man she chose. She chose [[menelaus|Menelaus]] — so when [[paris|Paris]] took her, the oath obliged the entire Greek world to sail. This is the mechanism that turns an elopement into [[trojanwar|a ten-year war]]." },

  /* ---------- ERA VI ---------- */
  { id: "aeneas", name: "Aeneas", type: "hero", x: 250, y: 2345, era: 5,
    story: "Trojan prince, son of [[aphrodite|Aphrodite]] and the mortal Anchises. Homer has him fated to survive; Roman tradition makes that survival the point. He escapes [[sackoftroy|the burning city]] carrying his father on his back and leading his son by the hand, and sails west into [[aeneid|the Aeneid]]. Rome's founding myth is built on the losing side of the Trojan War." },
  { id: "lesserajax", name: "Ajax the Lesser", type: "hero", x: 400, y: 2455, era: 5,
    story: "A different Ajax — fast, skilled, and infamous for one act: during [[sackoftroy|the sack]] he dragged [[cassandra|Cassandra]] from [[athena|Athena]]'s altar and violated her there. The Greeks failed to punish him, so Athena punished the whole fleet, and he drowned boasting that he had survived the sea against the gods' will. His crime is why [[nostoi|so few of them get home]]." },
  { id: "cassandra", name: "Cassandra", type: "mortal", x: 545, y: 2345, era: 5,
    story: "Daughter of [[priam|Priam]], given true prophecy by Apollo and then cursed never to be believed when she refused him. She foresaw everything — the horse, the sack, her own death — and was dismissed as mad every time. Taken as [[agamemnon|Agamemnon]]'s prize, she walks into his house knowing exactly how she and he will [[agamemnonmurder|die there]]." },
  { id: "priam", name: "Priam", type: "mortal", x: 680, y: 2235, era: 5,
    story: "Old king of Troy, father of [[hector|Hector]], [[paris|Paris]] and [[cassandra|Cassandra]] among some fifty children. The most moving scene in [[iliad|the Iliad]] is Priam entering the Greek camp alone to kiss [[achilles|Achilles]]'s hands and beg for his son's body. He is cut down at his own altar during [[sackoftroy|the sack]]." },
  { id: "hector", name: "Hector", type: "mortal", x: 830, y: 2235, era: 5,
    story: "Eldest son of [[priam|Priam]] and Troy's best fighter — a defender rather than a glory-seeker, with a wife and small son on the walls behind him. He kills [[achilles|Achilles]]'s companion Patroclus, and Achilles kills him for it and drags his body behind a chariot. [[iliad|The Iliad]] ends with his funeral, not with the fall of the city." },
  { id: "trojanwar", name: "The Trojan War Begins", type: "event", x: 1000, y: 2235, era: 5,
    story: "[[paris|Paris]] takes [[helen|Helen]] to Troy; [[suitorsoath|the oath]] obliges every Greek king to sail under [[agamemnon|Agamemnon]]. The army that gathers is the sons of the [[argonauts|Argonauts]] and the veterans of [[epigoni|the Theban wars]] — three generations of myth converging on one beach. The siege lasts ten years." },
  { id: "aulis", name: "The Sacrifice at Aulis", type: "event", x: 1450, y: 2355, era: 5,
    story: "The fleet sat becalmed at Aulis, and the seer said Artemis required [[agamemnon|Agamemnon]]'s daughter. He lured [[iphigenia|Iphigenia]] there with a false promise of marriage to [[achilles|Achilles]] and cut her throat. The wind came. [[clytemnestra|Clytemnestra]] never forgives it, and it is the reason she is [[agamemnonmurder|waiting for him]] ten years later." },
  { id: "iphigenia", name: "Iphigenia", type: "mortal", x: 1450, y: 2235, era: 5,
    story: "Daughter of [[agamemnon|Agamemnon]] and [[clytemnestra|Clytemnestra]], [[aulis|sacrificed for a favourable wind]]. In one strand of the tradition Artemis substitutes a deer at the last moment and carries her to the Black Sea as a priestess, where her brother [[orestes|Orestes]] eventually finds her alive. Greek myth often lets a horror stand and be undone at the same time." },
  { id: "iliad", name: "The Iliad", type: "event", x: 1000, y: 2345, era: 5,
    story: "Not the whole war — about seven weeks of it in year ten. [[agamemnon|Agamemnon]] takes a war prize from [[achilles|Achilles]], who withdraws and lets the Greeks be slaughtered until [[hector|Hector]] kills his companion Patroclus. The poem is about rage and its cost, and it ends with [[priam|Priam]] retrieving his son's body — no wooden horse, no fall of the city." },
  { id: "achillesdeath", name: "The Death of Achilles", type: "event", x: 860, y: 2455, era: 5,
    story: "[[paris|Paris]], the worst fighter in Troy, kills the best warrior in the world with an arrow guided by Apollo into his heel — the one spot [[thetis|Thetis]] missed. The contest for his armour afterwards destroys [[ajax|Ajax]] too. Neither death is in [[iliad|the Iliad]]; both come from the wider epic cycle." },
  { id: "trojanhorse", name: "The Wooden Horse", type: "event", x: 1160, y: 2345, era: 5,
    story: "[[odysseus|Odysseus]]'s scheme: a hollow horse left as an offering, the fleet apparently sailed away, and a planted informer to talk the Trojans into hauling it inside. [[cassandra|Cassandra]] and the priest Laocoön both warned against it and both were ignored. Ten years of siege undone in one night by a trick." },
  { id: "sackoftroy", name: "The Sack of Troy", type: "event", x: 1160, y: 2455, era: 5,
    story: "The city burns. [[priam|Priam]] is killed at his altar, [[hector|Hector]]'s infant son is thrown from the walls, and [[lesserajax|Ajax the Lesser]] violates [[cassandra|Cassandra]] in [[athena|Athena]]'s temple — an act so offensive the goddess turns on her own side. [[aeneas|Aeneas]] escapes. Everything after this is consequence: [[nostoi|the returns]], [[odyssey|the Odyssey]], [[aeneid|the Aeneid]]." },

  /* ---------- ERA VII ---------- */
  { id: "aeneid", name: "The Aeneid", type: "event", x: 250, y: 2625, era: 6,
    story: "Virgil's epic, written for Rome seven centuries after Homer. [[aeneas|Aeneas]] wanders the Mediterranean much as [[odyssey|Odysseus]] does — storms, monsters, a descent to the underworld — then wages a war in Italy that mirrors the Iliad. Its structural argument is that Rome inherits Troy's destiny, and it is the reason Greek myth has a Roman sequel at all." },
  { id: "dido", name: "Dido", type: "mortal", x: 250, y: 2745, era: 6,
    story: "Queen and founder of Carthage, who takes in [[aeneas|Aeneas]] and falls in love with him. He leaves at the gods' command; she builds a pyre, curses his descendants and kills herself. Virgil is explaining the Punic Wars — Rome and Carthage's mutual hatred is written into their founders' love affair. When Aeneas meets her again in the underworld, she will not speak to him." },
  { id: "rome", name: "Rome", type: "place", x: 250, y: 2865, era: 6,
    story: "Not founded by [[aeneas|Aeneas]] but descended from him: his son Ascanius founds Alba Longa, and centuries later Romulus and Remus come from that line. The gap is deliberate — it lets Rome claim Trojan ancestry without pretending the [[aeneid|Aeneid]] and the wolf-twins are the same story." },
  { id: "nostoi", name: "The Nostoi", type: "event", x: 600, y: 2625, era: 6,
    story: "'The Returns' — a mostly lost epic about how the other Greeks got home after [[sackoftroy|the sack]]. Because of [[lesserajax|Ajax the Lesser]]'s crime, [[athena|Athena]] had [[poseidon|Poseidon]] wreck the fleet: Ajax drowned, [[menelaus|Menelaus]] spent eight years reaching Egypt and back, [[diomedes|Diomedes]] came home to an unfaithful wife and resettled in Italy, and [[agamemnonmurder|Agamemnon]] sailed straight into an ambush. [[odyssey|The Odyssey]] is the one survivor of this genre." },
  { id: "odyssey", name: "The Odyssey", type: "event", x: 900, y: 2625, era: 6,
    story: "Ten years of [[odysseus|Odysseus]] trying to get home — the Cyclops, [[circe|Circe]], the Sirens, Calypso, a visit to the dead where he meets [[achilles|Achilles]] and [[agamemnon|Agamemnon]]'s ghost. [[poseidon|Poseidon]] blocks him at every turn for blinding his son. He reaches Ithaca disguised and kills the men besieging [[penelope|Penelope]]." },
  { id: "penelope", name: "Penelope", type: "mortal", x: 900, y: 2745, era: 6,
    story: "[[odysseus|Odysseus]]'s wife, who holds Ithaca for twenty years against a house full of suitors by weaving a shroud each day and unpicking it each night. Homer sets her deliberately against [[clytemnestra|Clytemnestra]] — the same situation, the opposite choice — and the [[odyssey|Odyssey]] keeps making the comparison out loud." },
  { id: "circe", name: "Circe", type: "mortal", x: 1060, y: 2625, era: 6,
    story: "A sorceress on the island of Aeaea, aunt of [[medea|Medea]], who turns [[odysseus|Odysseus]]'s crew into pigs and then becomes his ally and lover for a year. She tells him how to reach the land of the dead. In [[telegony|the last story of the cycle]] she is the mother of the son who kills him." },
  { id: "telegonus", name: "Telegonus", type: "mortal", x: 1060, y: 2745, era: 6,
    story: "Son of [[odysseus|Odysseus]] and [[circe|Circe]], raised without knowing his father. He goes looking for him, lands on Ithaca, raids it for food, and [[telegony|kills the man who comes out to fight him]] with a spear tipped in stingray barb — not recognising him until it is done." },
  { id: "telegony", name: "The Telegony", type: "event", x: 1060, y: 2865, era: 6,
    story: "The lost epic that closes the whole cycle. [[telegonus|Telegonus]] kills [[odysseus|Odysseus]] by accident — 'death from the sea', exactly as prophesied in [[odyssey|the Odyssey]]. Then, extraordinarily, he marries [[penelope|Penelope]] and Odysseus's son Telemachus marries [[circe|Circe]]. Ancient audiences liked their endings tidy rather than comfortable." },
  { id: "agamemnonmurder", name: "The Murder of Agamemnon", type: "event", x: 1500, y: 2625, era: 6,
    story: "[[agamemnon|Agamemnon]] comes home victorious and [[clytemnestra|Clytemnestra]] receives him warmly, then kills him in his bath with [[aegisthus|Aegisthus]]'s help — for [[aulis|Iphigenia]], for [[cassandra|Cassandra]] on his arm, and because Aegisthus has been owed this since [[thyesteanfeast|the feast]]. Three generations of the curse arriving at once." },
  { id: "orestes", name: "Orestes", type: "hero", x: 1500, y: 2745, era: 6,
    story: "Son of [[agamemnon|Agamemnon]] and [[clytemnestra|Clytemnestra]], smuggled out as a child. Apollo commands him to avenge his father, which means killing his mother — an obligation that is also an unforgivable crime. He does it, and [[orestesrevenge|the Furies]] come for him. His story is the curse's last move." },
  { id: "electra", name: "Electra", type: "mortal", x: 1660, y: 2745, era: 6,
    story: "Daughter of [[agamemnon|Agamemnon]], kept in the palace by [[clytemnestra|Clytemnestra]] and [[aegisthus|Aegisthus]] and married off beneath her rank to keep her sons harmless. She waits years for [[orestes|Orestes]] and pushes him to go through with it. All three great tragedians wrote her, and they disagree sharply about whether she is right." },
  { id: "orestesrevenge", name: "The Trial of Orestes", type: "event", x: 1500, y: 2865, era: 6,
    story: "[[orestes|Orestes]] kills [[clytemnestra|Clytemnestra]] and [[aegisthus|Aegisthus]] and is hunted mad by the Furies, who prosecute mother-murder and do not care what Apollo ordered. [[athena|Athena]] convenes a jury of Athenian citizens; the vote ties; she acquits him. A court replaces the blood feud, and the curse that began with [[tantalusfeast|Tantalus]] finally stops. That is Athens's argument about civilisation, staged as the end of a family's story." },
];

/* ------------------------------------------------------------------ */
/*  EDGES                                                              */
/* ------------------------------------------------------------------ */
const e = (a, b, t) => ({ a, b, t });
const EDGES = [
  /* bloodlines */
  e("titans", "cronus", "blood"), e("titans", "prometheus", "blood"), e("titans", "epimetheus", "blood"),
  e("cronus", "zeus", "blood"), e("cronus", "poseidon", "blood"), e("cronus", "hades", "blood"),
  e("cronus", "hera", "blood"), e("cronus", "demeter", "blood"),
  e("zeus", "athena", "blood"), e("zeus", "ares", "blood"), e("hera", "ares", "blood"),
  e("hera", "hephaestus", "blood"), e("zeus", "persephone", "blood"), e("demeter", "persephone", "blood"),
  e("prometheus", "deucalion", "blood"), e("epimetheus", "pyrrha", "blood"), e("pandora", "pyrrha", "blood"),
  e("deucalion", "hellen", "blood"), e("pyrrha", "hellen", "blood"),
  e("hellen", "dorus", "blood"), e("hellen", "aeolus", "blood"), e("hellen", "xuthus", "blood"),
  e("cadmus", "europa", "blood"), e("zeus", "europa", "union"),
  e("cadmus", "semele", "blood"), e("harmonia", "semele", "blood"),
  e("zeus", "dionysus", "blood"), e("semele", "dionysus", "blood"),
  e("cadmus", "pentheus", "descent"), e("cadmus", "laius", "descent"),
  e("laius", "oedipus", "blood"), e("jocasta", "oedipus", "blood"),
  e("oedipus", "eteocles", "blood"), e("oedipus", "polynices", "blood"), e("oedipus", "antigone", "blood"),
  e("acrisius", "danae", "blood"), e("zeus", "perseus", "blood"), e("danae", "perseus", "blood"),
  e("perseus", "alcmene", "descent"), e("zeus", "heracles", "blood"), e("alcmene", "heracles", "blood"),
  e("aegeus", "theseus", "blood"), e("poseidon", "theseus", "blood"),
  e("tantalus", "pelops", "blood"), e("pelops", "atreus", "blood"), e("pelops", "thyestes", "blood"),
  e("hippodamia", "atreus", "blood"), e("hippodamia", "thyestes", "blood"),
  e("atreus", "agamemnon", "blood"), e("atreus", "menelaus", "blood"), e("thyestes", "aegisthus", "blood"),
  e("zeus", "helen", "blood"), e("leda", "helen", "blood"),
  e("zeus", "polydeuces", "blood"), e("leda", "polydeuces", "blood"),
  e("tyndareus", "clytemnestra", "blood"), e("leda", "clytemnestra", "blood"),
  e("tyndareus", "castor", "blood"), e("leda", "castor", "blood"),
  e("agamemnon", "iphigenia", "blood"), e("clytemnestra", "iphigenia", "blood"),
  e("agamemnon", "orestes", "blood"), e("clytemnestra", "orestes", "blood"),
  e("agamemnon", "electra", "blood"), e("clytemnestra", "electra", "blood"),
  e("peleus", "achilles", "blood"), e("thetis", "achilles", "blood"),
  e("peleus", "telamon", "blood"), e("telamon", "ajax", "blood"),
  e("priam", "hector", "blood"), e("priam", "paris", "blood"), e("priam", "cassandra", "blood"),
  e("aphrodite", "aeneas", "blood"), e("aeneas", "rome", "descent"),
  e("circe", "telegonus", "blood"), e("odysseus", "telegonus", "blood"),
  e("europa", "minotaur", "descent"),

  /* unions */
  e("zeus", "hera", "union"), e("hades", "persephone", "union"), e("epimetheus", "pandora", "union"),
  e("deucalion", "pyrrha", "union"), e("cadmus", "harmonia", "union"), e("perseus", "andromeda", "union"),
  e("oedipus", "jocasta", "union"), e("pelops", "hippodamia", "union"), e("peleus", "thetis", "union"),
  e("leda", "tyndareus", "union"), e("jason", "medea", "union"), e("theseus", "ariadne", "union"),
  e("dionysus", "ariadne", "union"), e("menelaus", "helen", "union"), e("agamemnon", "clytemnestra", "union"),
  e("aegisthus", "clytemnestra", "union"), e("odysseus", "penelope", "union"), e("aeneas", "dido", "union"),
  e("paris", "helen", "union"),

  /* appears in story */
  e("titans", "titanomachy", "part"), e("cronus", "titanomachy", "part"), e("zeus", "titanomachy", "part"),
  e("zeus", "cosmosdivision", "part"), e("poseidon", "cosmosdivision", "part"), e("hades", "cosmosdivision", "part"),
  e("hades", "persephonemyth", "part"), e("persephone", "persephonemyth", "part"), e("demeter", "persephonemyth", "part"),
  e("prometheus", "mankindclay", "part"), e("athena", "mankindclay", "part"),
  e("prometheus", "sacrificetrick", "part"), e("zeus", "sacrificetrick", "part"),
  e("prometheus", "theftoffire", "part"), e("zeus", "theftoffire", "part"),
  e("prometheus", "prometheusbound", "part"), e("hephaestus", "prometheusbound", "part"),
  e("pandora", "pandorasjar", "part"), e("epimetheus", "pandorasjar", "part"),
  e("hephaestus", "pandorasjar", "part"), e("zeus", "pandorasjar", "part"),
  e("zeus", "theflood", "part"), e("deucalion", "theflood", "part"),
  e("pyrrha", "theflood", "part"), e("prometheus", "theflood", "part"),
  e("deucalion", "stonesmen", "part"), e("pyrrha", "stonesmen", "part"), e("hellen", "stonesmen", "part"),
  e("athena", "athenscontest", "part"), e("poseidon", "athenscontest", "part"),
  e("cecrops", "athenscontest", "part"), e("athens", "athenscontest", "part"),
  e("cadmus", "thebesfounding", "part"), e("ares", "thebesfounding", "part"),
  e("thebes", "thebesfounding", "part"), e("harmonia", "thebesfounding", "part"),
  e("perseus", "medusaquest", "part"), e("medusa", "medusaquest", "part"),
  e("athena", "medusaquest", "part"), e("andromeda", "medusaquest", "part"),
  e("tantalus", "tantalusfeast", "part"), e("pelops", "tantalusfeast", "part"), e("demeter", "tantalusfeast", "part"),
  e("pelops", "pelopsrace", "part"), e("hippodamia", "pelopsrace", "part"),
  e("heracles", "labors", "part"), e("hera", "labors", "part"), e("hades", "labors", "part"),
  e("theseus", "minotaurmyth", "part"), e("minotaur", "minotaurmyth", "part"),
  e("ariadne", "minotaurmyth", "part"), e("aegeus", "minotaurmyth", "part"),
  e("theseus", "atticaunion", "part"), e("athens", "atticaunion", "part"),
  e("theseus", "underworldraid", "part"), e("hades", "underworldraid", "part"), e("persephone", "underworldraid", "part"),
  e("heracles", "heraclesdeath", "part"),
  e("jason", "argonauts", "part"), e("medea", "argonauts", "part"), e("peleus", "argonauts", "part"),
  e("telamon", "argonauts", "part"), e("heracles", "argonauts", "part"),
  e("castor", "argonauts", "part"), e("polydeuces", "argonauts", "part"),
  e("oedipus", "oedipusmyth", "part"), e("laius", "oedipusmyth", "part"),
  e("jocasta", "oedipusmyth", "part"), e("thebes", "oedipusmyth", "part"),
  e("atreus", "thyesteanfeast", "part"), e("thyestes", "thyesteanfeast", "part"), e("aegisthus", "thyesteanfeast", "part"),
  e("polynices", "seventhebes", "part"), e("eteocles", "seventhebes", "part"),
  e("antigone", "seventhebes", "part"), e("thebes", "seventhebes", "part"), e("harmonia", "seventhebes", "part"),
  e("diomedes", "epigoni", "part"), e("alcmaeon", "epigoni", "part"), e("thebes", "epigoni", "part"),
  e("peleus", "peleusthetiswedding", "part"), e("thetis", "peleusthetiswedding", "part"),
  e("eris", "peleusthetiswedding", "part"), e("chiron", "peleusthetiswedding", "part"),
  e("eris", "goldenapple", "part"), e("hera", "goldenapple", "part"),
  e("athena", "goldenapple", "part"), e("aphrodite", "goldenapple", "part"),
  e("paris", "judgmentparis", "part"), e("aphrodite", "judgmentparis", "part"),
  e("hera", "judgmentparis", "part"), e("athena", "judgmentparis", "part"), e("helen", "judgmentparis", "part"),
  e("helen", "suitorsoath", "part"), e("menelaus", "suitorsoath", "part"),
  e("odysseus", "suitorsoath", "part"), e("tyndareus", "suitorsoath", "part"), e("agamemnon", "suitorsoath", "part"),
  e("castor", "dioscuri", "part"), e("polydeuces", "dioscuri", "part"), e("zeus", "dioscuri", "part"), e("helen", "dioscuri", "part"),
  e("helen", "trojanwar", "part"), e("paris", "trojanwar", "part"),
  e("menelaus", "trojanwar", "part"), e("agamemnon", "trojanwar", "part"),
  e("agamemnon", "aulis", "part"), e("iphigenia", "aulis", "part"), e("clytemnestra", "aulis", "part"),
  e("achilles", "iliad", "part"), e("hector", "iliad", "part"),
  e("agamemnon", "iliad", "part"), e("odysseus", "iliad", "part"), e("priam", "iliad", "part"),
  e("achilles", "achillesdeath", "part"), e("paris", "achillesdeath", "part"), e("ajax", "achillesdeath", "part"),
  e("odysseus", "trojanhorse", "part"), e("cassandra", "trojanhorse", "part"),
  e("lesserajax", "sackoftroy", "part"), e("cassandra", "sackoftroy", "part"),
  e("aeneas", "sackoftroy", "part"), e("priam", "sackoftroy", "part"), e("athena", "sackoftroy", "part"),
  e("menelaus", "nostoi", "part"), e("lesserajax", "nostoi", "part"), e("diomedes", "nostoi", "part"),
  e("athena", "nostoi", "part"), e("helen", "nostoi", "part"),
  e("odysseus", "odyssey", "part"), e("penelope", "odyssey", "part"),
  e("circe", "odyssey", "part"), e("poseidon", "odyssey", "part"),
  e("telegonus", "telegony", "part"), e("circe", "telegony", "part"), e("penelope", "telegony", "part"),
  e("aeneas", "aeneid", "part"), e("dido", "aeneid", "part"), e("rome", "aeneid", "part"),
  e("agamemnon", "agamemnonmurder", "part"), e("clytemnestra", "agamemnonmurder", "part"),
  e("aegisthus", "agamemnonmurder", "part"), e("cassandra", "agamemnonmurder", "part"),
  e("orestes", "orestesrevenge", "part"), e("clytemnestra", "orestesrevenge", "part"),
  e("electra", "orestesrevenge", "part"), e("athena", "orestesrevenge", "part"), e("athens", "orestesrevenge", "part"),

  /* causal chains */
  e("titanomachy", "cosmosdivision", "cause"),
  e("mankindclay", "sacrificetrick", "cause"), e("sacrificetrick", "theftoffire", "cause"),
  e("theftoffire", "prometheusbound", "cause"), e("theftoffire", "pandorasjar", "cause"),
  e("pandorasjar", "theflood", "cause"), e("theflood", "stonesmen", "cause"),
  e("thebesfounding", "oedipusmyth", "cause"), e("oedipusmyth", "seventhebes", "cause"),
  e("seventhebes", "epigoni", "cause"),
  e("minotaurmyth", "atticaunion", "cause"), e("labors", "heraclesdeath", "cause"),
  e("tantalusfeast", "pelopsrace", "cause"), e("pelopsrace", "thyesteanfeast", "cause"),
  e("thyesteanfeast", "agamemnonmurder", "cause"),
  e("peleusthetiswedding", "goldenapple", "cause"), e("goldenapple", "judgmentparis", "cause"),
  e("judgmentparis", "trojanwar", "cause"), e("suitorsoath", "trojanwar", "cause"),
  e("trojanwar", "aulis", "cause"), e("aulis", "iliad", "cause"),
  e("iliad", "achillesdeath", "cause"), e("iliad", "trojanhorse", "cause"),
  e("trojanhorse", "sackoftroy", "cause"),
  e("sackoftroy", "nostoi", "cause"), e("sackoftroy", "odyssey", "cause"), e("sackoftroy", "aeneid", "cause"),
  e("nostoi", "agamemnonmurder", "cause"), e("agamemnonmurder", "orestesrevenge", "cause"),
  e("odyssey", "telegony", "cause"),

  /* long-range crossovers */
  e("heracles", "prometheusbound", "crossover"),
  e("heracles", "underworldraid", "crossover"),
  e("chiron", "achilles", "crossover"),
  e("theseus", "dioscuri", "crossover"),
  e("diomedes", "iliad", "crossover"),
  e("prometheus", "peleusthetiswedding", "crossover"),
  e("atreus", "perseus", "crossover"),
  e("argonauts", "trojanwar", "crossover"),
  e("epigoni", "trojanwar", "crossover"),
  e("alcmaeon", "orestesrevenge", "crossover"),
  e("penelope", "clytemnestra", "crossover"),
  e("telamon", "ajax", "crossover"),
  e("medea", "circe", "crossover"),
];

/* ------------------------------------------------------------------ */
/*  DERIVED                                                            */
/* ------------------------------------------------------------------ */
const BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));
const ADJ = {};
NODES.forEach((n) => (ADJ[n.id] = new Set()));
EDGES.forEach((ed) => {
  if (ADJ[ed.a] && ADJ[ed.b]) {
    ADJ[ed.a].add(ed.b);
    ADJ[ed.b].add(ed.a);
  }
});

function wrap(text, max) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= max) cur += " " + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

const LAYOUT = {};
NODES.forEach((n) => {
  const isEvent = n.type === "event";
  const lines = wrap(n.name, isEvent ? 17 : 15);
  const longest = Math.max(...lines.map((l) => l.length));
  LAYOUT[n.id] = {
    lines,
    w: longest * 6.1 + 22,
    h: lines.length * 13 + 12,
    isEvent,
  };
});

/* ------------------------------------------------------------------ */
/*  INLINE RICH TEXT                                                   */
/* ------------------------------------------------------------------ */
function RichText({ text, onNav }) {
  const out = [];
  const re = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    const id = m[1];
    const label = m[2];
    const target = BY_ID[id];
    out.push(
      <button
        key={k++}
        onClick={() => onNav(id)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          font: "inherit",
          cursor: "pointer",
          color: target ? typeColor(target.type) : C.muted,
          borderBottom: "1px dotted currentColor",
          lineHeight: "inherit",
        }}
      >
        {label}
      </button>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<span key={k++}>{text.slice(last)}</span>);
  return <>{out}</>;
}

function typeColor(t) {
  return C[t] || C.muted;
}

/* ------------------------------------------------------------------ */
/*  MAIN                                                               */
/* ------------------------------------------------------------------ */
export default function MythMap() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [filters, setFilters] = useState({
    blood: true, descent: true, union: true, part: true, cause: true, crossover: true,
  });
  const [query, setQuery] = useState("");
  const [view, setView] = useState({ k: 0.6, tx: 40, ty: 20 });
  const [size, setSize] = useState({ w: 900, h: 600 });
  const [mode, setMode] = useState("map");
  const [showLegend, setShowLegend] = useState(false);

  const wrapRef = useRef(null);
  const pointers = useRef(new Map());
  const lastDist = useRef(null);
  const dragged = useRef(false);
  const panelRef = useRef(null);

  /* fonts */
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
    return () => { try { document.head.removeChild(l); } catch (err) { /* already gone */ } };
  }, []);

  /* size */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const narrow = size.w < 760;

  const active = hovered || selected;
  const focusSet = useMemo(() => {
    if (!active) return null;
    const s = new Set([active]);
    ADJ[active]?.forEach((x) => s.add(x));
    return s;
  }, [active]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return NODES.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  /* ---- navigation ---- */
  const centerOn = useCallback(
    (id) => {
      const n = BY_ID[id];
      if (!n) return;
      setView((v) => {
        const k = Math.max(v.k, 0.75);
        return { k, tx: size.w / 2 - n.x * k, ty: size.h / 2 - n.y * k };
      });
    },
    [size.w, size.h]
  );

  const navigate = useCallback(
    (id) => {
      setSelected(id);
      centerOn(id);
      if (panelRef.current) panelRef.current.scrollTop = 0;
    },
    [centerOn]
  );

  /* ---- pointer pan / pinch ---- */
  const onPointerDown = (ev) => {
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    dragged.current = false;
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
  };
  const onPointerMove = (ev) => {
    if (!pointers.current.has(ev.pointerId)) return;
    const prev = pointers.current.get(ev.pointerId);
    const dx = ev.clientX - prev.x;
    const dy = ev.clientY - prev.y;
    pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (Math.abs(dx) + Math.abs(dy) > 3) dragged.current = true;

    if (pointers.current.size === 1) {
      setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (lastDist.current) {
        const rect = wrapRef.current.getBoundingClientRect();
        const mx = (pts[0].x + pts[1].x) / 2 - rect.left;
        const my = (pts[0].y + pts[1].y) / 2 - rect.top;
        zoomAt(mx, my, d / lastDist.current);
      }
      lastDist.current = d;
    }
  };
  const onPointerUp = (ev) => {
    pointers.current.delete(ev.pointerId);
    if (pointers.current.size < 2) lastDist.current = null;
  };

  const zoomAt = (sx, sy, factor) => {
    setView((v) => {
      const k = Math.min(2.2, Math.max(0.18, v.k * factor));
      const wx = (sx - v.tx) / v.k;
      const wy = (sy - v.ty) / v.k;
      return { k, tx: sx - wx * k, ty: sy - wy * k };
    });
  };

  const onWheel = (ev) => {
    const rect = wrapRef.current.getBoundingClientRect();
    zoomAt(ev.clientX - rect.left, ev.clientY - rect.top, ev.deltaY < 0 ? 1.1 : 1 / 1.1);
  };

  const jumpEra = (i) => {
    const era = ERAS[i];
    setView((v) => {
      const k = narrow ? 0.42 : 0.62;
      return { k, tx: size.w / 2 - (W / 2) * k, ty: 70 - era.y0 * k };
    });
  };

  const sel = selected ? BY_ID[selected] : null;

  /* grouped connections for panel */
  const connections = useMemo(() => {
    if (!selected) return [];
    const groups = {};
    EDGES.forEach((ed) => {
      let other = null;
      if (ed.a === selected) other = ed.b;
      else if (ed.b === selected) other = ed.a;
      if (!other || !BY_ID[other]) return;
      (groups[ed.t] = groups[ed.t] || new Set()).add(other);
    });
    return Object.entries(groups).map(([t, s]) => ({ t, ids: [...s] }));
  }, [selected]);

  const font = "'IBM Plex Sans', system-ui, sans-serif";
  const display = "'Cormorant Garamond', Georgia, serif";
  const mono = "'IBM Plex Mono', ui-monospace, monospace";

  /* ---------------- render ---------------- */
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: C.void,
        color: C.star,
        fontFamily: font,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ---------- header ---------- */}
      <div
        style={{
          borderBottom: `1px solid ${C.rule}`,
          padding: narrow ? "10px 12px" : "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          background: "rgba(10,15,30,0.9)",
          zIndex: 5,
        }}
      >
        <div style={{ marginRight: "auto" }}>
          <div
            style={{
              fontFamily: display,
              fontSize: narrow ? 21 : 25,
              fontWeight: 600,
              letterSpacing: "0.02em",
              lineHeight: 1.1,
            }}
          >
            The Constellation of Greek Myth
          </div>
          <div style={{ fontFamily: mono, fontSize: 10.5, color: C.faint, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>
            {NODES.length} figures · {EDGES.length} links · Titans to Rome
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["map", "index"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "6px 11px",
                borderRadius: 3,
                cursor: "pointer",
                border: `1px solid ${mode === m ? C.god : C.rule}`,
                background: mode === m ? "rgba(232,196,106,0.12)" : "transparent",
                color: mode === m ? C.god : C.muted,
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Search a name…"
            style={{
              background: C.panel,
              border: `1px solid ${C.rule}`,
              borderRadius: 3,
              color: C.star,
              padding: "7px 10px",
              fontSize: 13,
              fontFamily: font,
              width: narrow ? 150 : 190,
              outline: "none",
            }}
          />
          {matches.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                width: 230,
                background: C.panel,
                border: `1px solid ${C.rule}`,
                borderRadius: 3,
                zIndex: 20,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {matches.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setMode("map");
                    navigate(n.id);
                    setQuery("");
                  }}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    background: "none",
                    border: "none",
                    borderBottom: `1px solid ${C.rule}`,
                    color: C.star,
                    fontSize: 13,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: font,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: 7, background: typeColor(n.type), flexShrink: 0 }} />
                  {n.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- era rail ---------- */}
      {mode === "map" && (
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "7px 12px",
            borderBottom: `1px solid ${C.rule}`,
            overflowX: "auto",
            background: "rgba(16,24,48,0.55)",
            zIndex: 4,
          }}
        >
          {ERAS.map((era, i) => (
            <button
              key={era.n}
              onClick={() => jumpEra(i)}
              style={{
                whiteSpace: "nowrap",
                fontSize: 11.5,
                fontFamily: mono,
                letterSpacing: "0.05em",
                padding: "5px 9px",
                borderRadius: 3,
                border: `1px solid ${C.rule}`,
                background: "transparent",
                color: C.muted,
                cursor: "pointer",
              }}
            >
              <span style={{ color: C.god }}>{era.n}</span>&nbsp; {era.name}
            </button>
          ))}
          <button
            onClick={() => setShowLegend((s) => !s)}
            style={{
              whiteSpace: "nowrap",
              marginLeft: "auto",
              fontSize: 11.5,
              fontFamily: mono,
              padding: "5px 9px",
              borderRadius: 3,
              border: `1px solid ${showLegend ? C.god : C.rule}`,
              background: "transparent",
              color: showLegend ? C.god : C.muted,
              cursor: "pointer",
            }}
          >
            key
          </button>
        </div>
      )}

      {/* ---------- body ---------- */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }} ref={wrapRef}>
        {mode === "map" ? (
          <>
            <svg
              width={size.w}
              height={size.h}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              onClick={() => { if (!dragged.current) setSelected(null); }}
              style={{ touchAction: "none", cursor: "grab", display: "block" }}
            >
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
                {/* era bands */}
                {ERAS.map((era) => (
                  <g key={era.n}>
                    <rect
                      x={-60}
                      y={era.y0}
                      width={W + 120}
                      height={era.y1 - era.y0}
                      fill="#0e1428"
                      stroke={C.rule}
                      strokeWidth={0.7}
                      rx={4}
                    />
                    <text x={-40} y={era.y0 + 34} fill={C.god} fontSize={30} fontFamily={mono} opacity={0.55}>
                      {era.n}
                    </text>
                    <text x={-40} y={era.y0 + 54} fill={C.faint} fontSize={13} fontFamily={mono} letterSpacing="1.6">
                      {era.name.toUpperCase()}
                    </text>
                  </g>
                ))}

                {/* edges */}
                {EDGES.map((ed, i) => {
                  if (!filters[ed.t]) return null;
                  const A = BY_ID[ed.a];
                  const B = BY_ID[ed.b];
                  if (!A || !B) return null;
                  const st = EDGE_STYLE[ed.t];
                  const touches = focusSet && (ed.a === active || ed.b === active);
                  const op = focusSet ? (touches ? 0.95 : 0.05) : ed.t === "part" ? 0.3 : 0.5;
                  const mx = (A.x + B.x) / 2;
                  const my = (A.y + B.y) / 2;
                  const dx = B.x - A.x;
                  const dy = B.y - A.y;
                  const len = Math.hypot(dx, dy) || 1;
                  const bow = Math.min(48, len * 0.11);
                  const cx = mx + (-dy / len) * bow;
                  const cy = my + (dx / len) * bow;
                  return (
                    <path
                      key={i}
                      d={`M ${A.x} ${A.y} Q ${cx} ${cy} ${B.x} ${B.y}`}
                      fill="none"
                      stroke={st.color}
                      strokeWidth={touches ? st.w * 1.9 : st.w}
                      strokeDasharray={st.dash || undefined}
                      opacity={op}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* nodes */}
                {NODES.map((n) => {
                  const L = LAYOUT[n.id];
                  const dim = focusSet && !focusSet.has(n.id);
                  const isActive = active === n.id;
                  const col = typeColor(n.type);
                  return (
                    <g
                      key={n.id}
                      opacity={dim ? 0.13 : 1}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHovered(n.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        if (!dragged.current) setSelected(n.id === selected ? null : n.id);
                      }}
                    >
                      {isActive && <circle cx={n.x} cy={n.y} r={46} fill="url(#glow)" />}
                      {L.isEvent ? (
                        <>
                          <rect
                            x={n.x - L.w / 2}
                            y={n.y - L.h / 2}
                            width={L.w}
                            height={L.h}
                            rx={3}
                            fill={isActive ? "#15302f" : "#0f1f2c"}
                            stroke={col}
                            strokeWidth={isActive ? 1.8 : 1}
                          />
                          <text textAnchor="middle" fontSize={11} fontFamily={font} fill={C.star}>
                            {L.lines.map((ln, j) => (
                              <tspan key={j} x={n.x} y={n.y - L.h / 2 + 17 + j * 13}>
                                {ln}
                              </tspan>
                            ))}
                          </text>
                        </>
                      ) : (
                        <>
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={isActive ? 11 : 8}
                            fill={n.type === "place" ? "none" : col}
                            stroke={col}
                            strokeWidth={n.type === "place" ? 2 : isActive ? 3 : 0}
                            strokeOpacity={n.type === "place" ? 1 : 0.35}
                          />
                          <text textAnchor="middle" fontSize={12.5} fontFamily={font} fill={isActive ? "#fff" : C.star}>
                            {L.lines.map((ln, j) => (
                              <tspan key={j} x={n.x} y={n.y + 25 + j * 14}>
                                {ln}
                              </tspan>
                            ))}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* zoom controls */}
            <div style={{ position: "absolute", left: 12, bottom: 14, display: "flex", flexDirection: "column", gap: 5, zIndex: 3 }}>
              {[["+", 1.25], ["−", 0.8]].map(([lab, f]) => (
                <button
                  key={lab}
                  onClick={() => zoomAt(size.w / 2, size.h / 2, f)}
                  style={{
                    width: 32, height: 32, borderRadius: 3,
                    border: `1px solid ${C.rule}`, background: "rgba(16,24,48,0.9)",
                    color: C.star, fontSize: 16, cursor: "pointer",
                  }}
                >
                  {lab}
                </button>
              ))}
              <button
                onClick={() => setView({ k: narrow ? 0.4 : 0.6, tx: 60, ty: 20 })}
                style={{
                  width: 32, height: 32, borderRadius: 3, fontFamily: mono, fontSize: 9,
                  border: `1px solid ${C.rule}`, background: "rgba(16,24,48,0.9)",
                  color: C.muted, cursor: "pointer",
                }}
              >
                fit
              </button>
            </div>

            {/* legend */}
            {showLegend && (
              <div
                style={{
                  position: "absolute", left: 56, bottom: 14, zIndex: 6,
                  background: "rgba(16,24,48,0.97)", border: `1px solid ${C.rule}`,
                  borderRadius: 4, padding: 13, width: 236,
                }}
              >
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", color: C.faint, textTransform: "uppercase", marginBottom: 8 }}>
                  Lines — tap to filter
                </div>
                {Object.entries(EDGE_STYLE).map(([k, st]) => (
                  <button
                    key={k}
                    onClick={() => setFilters((f) => ({ ...f, [k]: !f[k] }))}
                    style={{
                      display: "flex", alignItems: "center", gap: 9, width: "100%",
                      background: "none", border: "none", padding: "4px 0",
                      cursor: "pointer", opacity: filters[k] ? 1 : 0.32,
                      color: C.star, fontSize: 12, fontFamily: font, textAlign: "left",
                    }}
                  >
                    <svg width="26" height="8" style={{ flexShrink: 0 }}>
                      <line x1="0" y1="4" x2="26" y2="4" stroke={st.color} strokeWidth={st.w + 0.5} strokeDasharray={st.dash || undefined} />
                    </svg>
                    {st.label}
                  </button>
                ))}
                <div style={{ height: 1, background: C.rule, margin: "9px 0" }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 11px" }}>
                  {Object.entries(TYPE_LABEL).map(([k, lab]) => (
                    <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.muted }}>
                      <span style={{ width: 8, height: 8, borderRadius: k === "event" ? 1 : 8, background: typeColor(k) }} />
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ---------- index mode ---------- */
          <div style={{ height: "100%", overflowY: "auto", padding: narrow ? "14px" : "20px 26px" }}>
            {ERAS.map((era, i) => (
              <div key={era.n} style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, borderBottom: `1px solid ${C.rule}`, paddingBottom: 6, marginBottom: 10 }}>
                  <span style={{ fontFamily: mono, color: C.god, fontSize: 17 }}>{era.n}</span>
                  <span style={{ fontFamily: display, fontSize: 21 }}>{era.name}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {NODES.filter((n) => n.era === i).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setSelected(n.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: selected === n.id ? "rgba(232,196,106,0.1)" : C.panel,
                        border: `1px solid ${selected === n.id ? C.god : C.rule}`,
                        borderRadius: 3, padding: "7px 11px", cursor: "pointer",
                        color: C.star, fontSize: 13, fontFamily: font,
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: n.type === "event" ? 1 : 8, background: typeColor(n.type), flexShrink: 0 }} />
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------- detail panel ---------- */}
        {sel && (
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              right: narrow ? 0 : 14,
              left: narrow ? 0 : "auto",
              bottom: narrow ? 0 : "auto",
              top: narrow ? "auto" : 14,
              width: narrow ? "100%" : 372,
              maxHeight: narrow ? "62%" : "calc(100% - 28px)",
              overflowY: "auto",
              background: "rgba(16,24,48,0.985)",
              border: `1px solid ${C.rule}`,
              borderRadius: narrow ? "10px 10px 0 0" : 5,
              padding: narrow ? "16px 16px 22px" : 18,
              zIndex: 10,
              boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: mono, fontSize: 10, letterSpacing: "0.16em",
                    textTransform: "uppercase", color: typeColor(sel.type), marginBottom: 4,
                  }}
                >
                  {TYPE_LABEL[sel.type]} · Era {ERAS[sel.era].n}
                </div>
                <div style={{ fontFamily: display, fontSize: 29, fontWeight: 600, lineHeight: 1.08 }}>{sel.name}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none", border: `1px solid ${C.rule}`, borderRadius: 3,
                  color: C.muted, width: 28, height: 28, cursor: "pointer", fontSize: 15, flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ height: 1, background: C.rule, margin: "13px 0" }} />

            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#d3dcf5", margin: 0 }}>
              <RichText text={sel.story} onNav={navigate} />
            </p>

            {connections.length > 0 && (
              <>
                <div style={{ height: 1, background: C.rule, margin: "16px 0 12px" }} />
                {connections.map((g) => (
                  <div key={g.t} style={{ marginBottom: 11 }}>
                    <div
                      style={{
                        fontFamily: mono, fontSize: 9.5, letterSpacing: "0.14em",
                        textTransform: "uppercase", color: EDGE_STYLE[g.t].color, marginBottom: 6,
                      }}
                    >
                      {EDGE_STYLE[g.t].label}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {g.ids.map((id) => (
                        <button
                          key={id}
                          onClick={() => navigate(id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: C.panelSoft, border: `1px solid ${C.rule}`,
                            borderRadius: 3, padding: "5px 9px", cursor: "pointer",
                            color: C.star, fontSize: 12.5, fontFamily: font,
                          }}
                        >
                          <span
                            style={{
                              width: 7, height: 7, flexShrink: 0,
                              borderRadius: BY_ID[id].type === "event" ? 1 : 7,
                              background: typeColor(BY_ID[id].type),
                            }}
                          />
                          {BY_ID[id].name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* first-run hint */}
        {!sel && mode === "map" && (
          <div
            style={{
              position: "absolute", right: 14, top: 14, maxWidth: 250,
              background: "rgba(16,24,48,0.92)", border: `1px solid ${C.rule}`,
              borderRadius: 5, padding: 13, fontSize: 12.8, lineHeight: 1.55, color: C.muted, zIndex: 2,
            }}
          >
            <span style={{ color: C.star }}>Tap any name</span> to read its story and light up everything it touches. Drag to move, pinch or scroll to zoom. The{" "}
            <span style={{ color: EDGE_STYLE.crossover.color }}>dotted red lines</span> are the long reaches — a story in one era pulling on one three eras away.
          </div>
        )}
      </div>
    </div>
  );
}
