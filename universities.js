const universitiesData = {
  uoc: {
    name: "University of Colombo (UOC)",
    location: "Colombo, Sri Lanka",
    type: "local",
    image: "/assets/uoc.jpg",
    logo: "/assets/uoc_logo.png",
    image2: "/assets/uoc_2.jpg",
    link: "https://cmb.ac.lk/",
    summary: "Located right in the heart of the capital, the University of Colombo is typically ranked as the #1 university in Sri Lanka. It is highly competitive and known for producing top-tier professionals in medicine, law, and corporate sectors.",
    bestKnownFor: "Medicine, Law, and Management.",
    degrees: [
      { category: "Medicine & Health", details: "MBBS, BSc in Nursing/Physiotherapy" },
      { category: "Tech & Science", details: "BSc in Computer Science, Data Science, Software Engineering, and Physical/Biological Sciences" },
      { category: "Business & Law", details: "LLB, BBA" }
    ]
  },
  uom: {
    name: "University of Moratuwa (UOM)",
    location: "Moratuwa, Sri Lanka",
    type: "local",
    image: "/assets/uom.jpg",
    logo: "/assets/uom_logo.png",
    image2: "/assets/uom_2.jpg",
    link: "https://uom.lk/",
    summary: "If you are interested in software development, engineering, or tech infrastructure, Moratuwa is the undisputed powerhouse of the island. It has an incredible reputation for tech and produces the country's most sought-after engineers.",
    bestKnownFor: "Engineering, Information Technology, and Architecture.",
    degrees: [
      { category: "Engineering", details: "BSc Engineering (Software, Electronic & Telecommunication, Mechanical, Civil, Chemical, etc.)" },
      { category: "Information Technology", details: "BSc in IT, IT & Management, and AI (Artificial Intelligence)" },
      { category: "Design & Architecture", details: "Bachelor of Architecture, Bachelor of Design (Fashion, Product)" }
    ]
  },
  uop: {
    name: "University of Peradeniya (UOP)",
    location: "Kandy, Sri Lanka",
    type: "local",
    image: "/assets/uop.jpg",
    logo: "/assets/uop_logo.png",
    image2: "/assets/uop_2.jpg",
    link: "https://www.pdn.ac.lk/",
    summary: "Located in Kandy, Peradeniya is famous for having one of the most beautiful, sprawling riverside campuses in Asia. It is a comprehensive university, meaning it offers a massive variety of subjects, and it leads the country in medical and scientific research.",
    bestKnownFor: "Medicine, Allied Health, Agriculture, and Engineering.",
    degrees: [
      { category: "Medical Sciences", details: "MBBS, BDS, BVSc" },
      { category: "Engineering & Tech", details: "BSc Eng in Computer Engineering, Electrical, Civil, and Mechanical" },
      { category: "Sciences & Arts", details: "BSc in Chemistry, Physics, Molecular Biology, and BA in Humanities" }
    ]
  },
  usj: {
    name: "University of Sri Jayewardenepura (USJ)",
    location: "Nugegoda, Sri Lanka",
    type: "local",
    image: "/assets/usj.jpg",
    logo: "/assets/usj_logo.png",
    image2: "/assets/usj_2.jpg",
    link: "https://www.sjp.ac.lk/",
    summary: "Affectionately known as 'Japura,' this university boasts the largest Management and Business faculty in the country. If someone wants to dominate the Sri Lankan corporate world, banking, or finance, Japura is highly respected.",
    bestKnownFor: "Management, Business Administration, and Applied Sciences.",
    degrees: [
      { category: "Management & Commerce", details: "BSc in Accounting, Business Administration, Finance, and Marketing" },
      { category: "Applied Sciences", details: "BSc in Cyber Security, Food Science, Computing, and Environmental Science" },
      { category: "Medical Sciences", details: "MBBS, BSc in Medical Laboratory Sciences" }
    ]
  },
  uok: {
    name: "University of Kelaniya (UOK)",
    location: "Kelaniya, Sri Lanka",
    type: "local",
    image: "/assets/uok.jpg",
    logo: "/assets/uok_logo.png",
    image2: "/assets/uok_2.jpg",
    link: "https://www.kln.ac.lk/",
    summary: "Kelaniya is highly ranked for its humanities and modern languages, but it also has a massive footprint in digital business and medicine (its medical faculty is based in Ragama).",
    bestKnownFor: "Commerce, Information Technology, Linguistics, and Medicine.",
    degrees: [
      { category: "Commerce & Tech", details: "BCom, BSc in MIT, BSc in Software Engineering" },
      { category: "Medicine", details: "MBBS, BSc in Speech and Hearing Sciences" },
      { category: "Humanities", details: "BA in Modern Languages, Mass Communication, and International Studies" }
    ]
  },
  mit: {
    name: "Massachusetts Institute of Technology (MIT)",
    location: "Cambridge, Massachusetts, US",
    type: "foreign",
    image: "/assets/mit.jpg",
    logo: "/assets/mit_logo.png",
    image2: "/assets/mit_2.jpg",
    link: "https://web.mit.edu/",
    summary: "Located in Cambridge, Massachusetts, MIT is consistently ranked as the #1 university in the world. It is the absolute peak for anyone wanting to study advanced computing, robotics, or engineering.",
    bestKnownFor: "Artificial Intelligence, Aerospace Engineering, Quantum Computing, and Physics.",
    degrees: [
      { category: "Tech & Engineering", details: "BSc in Computer Science & Engineering, Robotics, and Mechanical Engineering" },
      { category: "Advanced Sciences", details: "BSc in Physics, Mathematics, and Brain & Cognitive Sciences" }
    ]
  },
  stanford: {
    name: "Stanford University",
    location: "Silicon Valley, California, US",
    type: "foreign",
    image: "/assets/stanford.jpg",
    logo: "/assets/stanford_logo.png",
    image2: "/assets/stanford_2.jpg",
    link: "https://www.stanford.edu/",
    summary: "Situated right in the middle of Silicon Valley, California, Stanford has a massive entrepreneurial culture. It is famous for producing the tech founders who started companies like Google, Netflix, and Instagram.",
    bestKnownFor: "Software Engineering, Computer Science, and Business Entrepreneurship.",
    degrees: [
      { category: "Computing & Math", details: "BSc in Computer Science (AI/HCI tracks), Data Science" },
      { category: "Business & Humanities", details: "BA in Economics, International Relations" }
    ]
  },
  harvard: {
    name: "Harvard University",
    location: "Cambridge, Massachusetts, US",
    type: "foreign",
    image: "/assets/harvard.jpg",
    logo: "/assets/harvard_logo.png",
    image2: "/assets/harvard_2.jpg",
    link: "https://www.harvard.edu/",
    summary: "As the oldest university in the US, Harvard is the global symbol of prestige. It is incredibly wealthy and focuses heavily on creating global leaders, top lawyers, and medical innovators.",
    bestKnownFor: "Law, Medicine, Political Science, and Economics.",
    degrees: [
      { category: "Pre-Med & Science", details: "BA/BSc in Molecular & Cellular Biology, Biomedical Engineering" },
      { category: "Social Sciences & Law", details: "BA in Government, Economics, and Social Studies" }
    ]
  },
  oxford: {
    name: "University of Oxford",
    location: "Oxford, UK",
    type: "foreign",
    image: "/assets/oxford.jpg",
    logo: "/assets/oxford_logo.png",
    image2: "/assets/oxford_2.jpg",
    link: "https://www.ox.ac.uk/",
    summary: "The oldest university in the English-speaking world, Oxford uses a unique tutorial system where students study one-on-one or in tiny groups with world-class professors. It is incredibly strong in both deep tech and classical studies.",
    bestKnownFor: "Medicine, Philosophy, Mathematics, and English Literature.",
    degrees: [
      { category: "Math & Tech", details: "BA in Computer Science, Mathematics, or Engineering Science" },
      { category: "Medical Sciences", details: "BA in Medical Sciences" }
    ]
  },
  imperial: {
    name: "Imperial College London",
    location: "London, UK",
    type: "foreign",
    image: "/assets/imperial.jpg",
    logo: "/assets/imperial_logo.png",
    image2: "/assets/imperial_2.jpg",
    link: "https://www.imperial.ac.uk/",
    summary: "Located right in London, Imperial focuses strictly on science, engineering, medicine, and business. It is often considered the UK's version of MIT.",
    bestKnownFor: "Practical Engineering, Cyber Security, and Data Science.",
    degrees: [
      { category: "Engineering", details: "BEng/MEng in Computing, Electrical & Electronic Engineering" },
      { category: "Natural Sciences", details: "BSc in Biotechnology, Theoretical Physics" }
    ]
  },
  nus: {
    name: "National University of Singapore (NUS)",
    location: "Singapore, Asia",
    type: "foreign",
    image: "/assets/nus.jpg",
    logo: "/assets/nus_logo.png",
    image2: "/assets/nus_2.jpg",
    link: "https://nus.edu.sg/",
    summary: "For students in South Asia, NUS is the top-ranked destination closer to home. Singapore's tech infrastructure makes NUS an absolute powerhouse for modern computer science, AI development, and data security.",
    bestKnownFor: "Computer Science, Civil Engineering, and International Business.",
    degrees: [
      { category: "Computing", details: "BSc in Computer Science, Information Security, and Business Analytics" },
      { category: "Engineering", details: "BEng in Computer Engineering, Chemical Engineering" }
    ]
  }
};
