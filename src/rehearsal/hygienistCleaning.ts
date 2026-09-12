export interface HygienistBeat {
  said: string;
  utterances: string[];
}

export const HYGIENIST_CLEANING: HygienistBeat[] = [
  {
    said: "Alright Rita, I'm going to clean and check the gums as I go. You'll feel a little water and a little poke — that's me measuring the pockets, not a shot.",
    utterances: [],
  },
  {
    said: "Starting on the upper right, way in the back. Tooth one, the wisdom tooth. Facial: two two two. Looks quiet back here.",
    utterances: ["tooth one", "facial", "two two two"],
  },
  {
    said: "Palatal on one: two two two. I'm scaling that distal contact… okay, that's smooth.",
    utterances: ["palatal", "two two two"],
  },
  {
    said: "Tooth two. Facial two one two. Palatal two two two. No bleeding.",
    utterances: ["Tooth two. Facial two one two. Palatal two two two. No bleeding."],
  },
  {
    said: "Here's the six-year molar, tooth three. Facial three two three. Distal's a four — little extra inflammation. Bleeding on that distal.",
    utterances: ["tooth three", "facial", "three two three", "distal four", "bleeding"],
  },
  {
    said: "Palatal on three: two two three. I'm going to spend a little more time on that distal. Rinse for me?",
    utterances: ["palatal", "two two three"],
  },
  {
    said: "Premolars, tooth four. Facial two two two. Five, facial two two three. Canine, tooth six, two one two. These look healthy.",
    utterances: [
      "tooth four",
      "facial",
      "two two two",
      "tooth five",
      "two two three",
      "tooth six",
      "two one two",
    ],
  },
  {
    said: "Crossing the midline. Eight, facial two two two. Nine, two two two. Laterals are a two. You're doing a nice job up in the front.",
    utterances: [
      "tooth eight",
      "facial",
      "two two two",
      "tooth nine",
      "two two two",
      "tooth seven",
      "two two two",
      "tooth ten",
      "two two two",
    ],
  },
  {
    said: "Upper left canine, eleven. Two one two. First premolar twelve, two two two. Second premolar thirteen, two two three.",
    utterances: [
      "tooth eleven",
      "facial",
      "two one two",
      "tooth twelve",
      "two two two",
      "tooth thirteen",
      "two two three",
    ],
  },
  {
    said: "Okay, tooth fourteen — this is the upper left six-year molar. Last visit we had a watch on the distal. Facial: three two three.",
    utterances: ["tooth fourteen", "facial", "three two three"],
  },
  {
    said: "Distal five. That's deeper than March. Bleeding here too. The gum is a little puffy right at that contact.",
    utterances: ["distal five", "bleeding"],
  },
  {
    said: "Correction — yes, make that five. I'm going to watch that one. Palatal on fourteen: two two three.",
    utterances: ["make that five", "watch that", "palatal", "two two three"],
  },
  {
    said: "Fifteen, facial two two three. Wisdom tooth sixteen, two two two. Upper's done except that fourteen distal. Let's sit you up a second… okay, lower right.",
    utterances: ["tooth fifteen", "facial", "two two three", "tooth sixteen", "two two two"],
  },
  {
    said: "Lower right wisdom, thirty-two. Facial two two two. Thirty-one, two two three. First molar, thirty, three two three.",
    utterances: [
      "tooth 32",
      "facial",
      "two two two",
      "tooth 31",
      "two two three",
      "tooth 30",
      "three two three",
    ],
  },
  {
    said: "Premolars twenty-nine and twenty-eight, two two two. Canine twenty-seven, two one two. Lower anteriors look tight — twenty-five and twenty-six, twos.",
    utterances: [
      "tooth 29",
      "facial",
      "two two two",
      "tooth 28",
      "two two two",
      "tooth 27",
      "two one two",
      "tooth 26",
      "two two two",
      "tooth 25",
      "two two two",
    ],
  },
  {
    said: "Coming across to the lower left. Twenty-four and twenty-three, two two two. Canine twenty-two, two two two.",
    utterances: [
      "tooth 24",
      "facial",
      "two two two",
      "tooth 23",
      "two two two",
      "tooth 22",
      "two two two",
    ],
  },
  {
    said: "Tooth nineteen, the lower left six-year molar. This one was a four in March. Facial: four three four. Still a four on the mesial and distal. No bleeding today though — that's a good sign.",
    utterances: ["tooth nineteen", "facial", "four three four", "no bleeding"],
  },
  {
    said: "Lingual on nineteen: three three four. I'll scale under that distal. Eighteen, two two three. Wisdom seventeen, two two two.",
    utterances: [
      "lingual",
      "three three four",
      "tooth 18",
      "facial",
      "two two three",
      "tooth 17",
      "two two two",
    ],
  },
  {
    said: "I'm going to polish and floss through those contacts, especially fourteen and nineteen. Little more rinse. You did great.",
    utterances: [],
  },
  {
    said: "Okay, let's wrap up. Overall the mouth looks pretty calm. The one spot that moved is tooth fourteen on the distal — it went from a three in March to a five today, and it bled. Nineteen is holding at a four, no bleeding, so we'll keep watching it. Extra floss time behind that upper left molar, and we'll recheck those two spots next visit.",
    utterances: ["let's wrap up"],
  },
];
