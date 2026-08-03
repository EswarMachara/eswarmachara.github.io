import type { RichText } from "./types";
import type { ArticleAuthor, ArticleSection } from "./content";

export type BadgeVariant = "conf" | "workshop" | "journal" | "preprint" | "award" | "research";

export interface Publication {
  slug: string;
  title: string;
  paperHref?: string;
  venueBadge: { label: string; variant: BadgeVariant };
  authors: RichText;
  venue: string;
  thumbnail: string;
  links: { label: string; href: string }[];
  /** Present only for publications with a full write-up at /research/[slug]. */
  articleAuthors?: ArticleAuthor[];
  affiliations?: string[];
  dateLabel?: string;
  deck?: string;
  heroImage?: string;
  sections?: ArticleSection[];
}

export const publications: Publication[] = [
  {
    slug: "cips-net",
    title: "CIPS-Net: Text-Instructed Conditional Nucleus Instance Segmentation Network in Histopathology",
    venueBadge: { label: "MICCAI 2026", variant: "conf" },
    authors: [
      { text: "Nikhileswara Rao Sulake†, " },
      { text: "Sai Manikanta Eswar Machara", bold: true },
      { text: "†, Sivaji Retta, Iyyakutti Iyappan Ganapathi, Muhammad Owais, Irfan Hussain" },
    ],
    venue: "COMPAYL Workshop, MICCAI Society 2026",
    thumbnail: "/images/research/cips-net/hero.png",
    links: [],
    articleAuthors: [
      { name: "Nikhileswara Rao Sulake", href: "https://nikhil-rao20.github.io", affiliation: 1, equalContribution: true },
      { name: "Sai Manikanta Eswar Machara", affiliation: 1, equalContribution: true },
      { name: "Sivaji Retta", affiliation: 1 },
      { name: "Iyyakutti Iyappan Ganapathi", href: "https://scholar.google.com/citations?user=TMpGqLEAAAAJ&hl=en", affiliation: 2 },
      { name: "Muhammad Owais", affiliation: 2 },
      { name: "Irfan Hussain", affiliation: 2 },
    ],
    affiliations: [
      "Rajiv Gandhi University of Knowledge Technologies, Nuzvid, India",
      "Khalifa University Center for Autonomous Robotic Systems (KU-CARS), Khalifa University, UAE",
    ],
    dateLabel: "Accepted 2026",
    deck:
      "Most nucleus segmentation tools return every cell in an image and leave the filtering to the pathologist. CIPS-Net lets a pathologist ask for exactly the cells they need, in plain language, and segments only those.",
    heroImage: "/images/research/cips-net/hero.png",
    sections: [
      {
        heading: "A different way to ask for a segmentation",
        blocks: [
          {
            kind: "paragraph",
            text: "Most nucleus segmentation tools work the same way regardless of what a pathologist actually needs. They segment every nucleus in an image first, sort them into categories afterward, and leave the clinician to manually pick out the cells that matter for the question at hand. That segment everything, then classify approach works reasonably well, but it puts the burden of filtering on the person reading the slide, and it treats every diagnostic question as if it required the exact same output.",
          },
          {
            kind: "paragraph",
            text: "CIPS-Net starts from a different premise. Instead of producing one fixed set of masks, it lets a pathologist type an instruction such as segment inflammatory cells or segment dead cells and returns only what was asked for. The goal is not just convenience. Selective segmentation keeps the model's attention on the cell population that is actually relevant to the diagnostic question, which is closer to how a pathologist already works when reading a slide.",
          },
        ],
      },
      {
        heading: "Teaching a model to understand instructions",
        blocks: [
          {
            kind: "paragraph",
            text: "The architecture pairs a DINOv2 vision transformer with Bio_ClinicalBERT, a language model pretrained on clinical text. Image features and instruction embeddings meet at a cross-attention module we call Language-Guided Feature Enhancement, which lets the visual features attend to the specific tokens in the instruction rather than treating the whole sentence as a single flag. Further downstream, a FiLM-based conditioning scheme reshapes the decoder's skip connections at every scale, so the instruction keeps influencing the output through the entire network instead of being applied once and forgotten.",
          },
          {
            kind: "paragraph",
            text: "Four lightweight heads then turn those features into instances: one flags nucleus presence, one regresses a distance transform that seeds the instance boundaries, one produces per-pixel embeddings that get clustered into instances, and one classifies each instance's type. It is a fairly involved pipeline, but each head has a narrow job, and that separation is what keeps the model both accurate and fast.",
          },
          { kind: "image", src: "/images/research/cips-net/architecture.png", alt: "CIPS-Net architecture diagram" },
        ],
      },
      {
        heading: "Training without asking for more labels",
        blocks: [
          {
            kind: "paragraph",
            text: "One practical obstacle to text-conditioned segmentation is that most public pathology datasets, including PanNuke, only ship image-mask pairs, not language descriptions. Rather than collect a new dataset, we generated instructions automatically from the existing class labels, and, more importantly, trained on every possible non-empty subset of classes present in each image. An image with three annotated cell types yields seven different training examples, one for each combination a pathologist might ask for. This permutation-based strategy is what actually teaches the model to respect the instruction instead of segmenting everything and ignoring the text.",
          },
        ],
      },
      {
        heading: "What the numbers say",
        blocks: [
          {
            kind: "paragraph",
            text: "On PanNuke, evaluated with the standard three-fold cross-validation protocol, CIPS-Net reaches a multi-class panoptic quality of 0.4846 and a binary panoptic quality of 0.6217. That is competitive with strong unconditional baselines such as CPP-Net, and it clearly outperforms the vision-language segmentation baselines we compared against, including LViT and Grounding DINO adapted to this task. What we found more interesting is where the gains showed up: CIPS-Net's performance on the Dead and Inflammatory classes, both rare and diagnostically important, improved noticeably over the strongest unconditional baseline, a reasonable sign that focusing a model's attention on a specific instruction helps most where it is needed most.",
          },
          {
            kind: "paragraph",
            text: "Efficiency held up too. CIPS-Net needs about 11 percent fewer computations and runs roughly 20 percent faster than the best-performing unconditional baseline we tested against, while its trainable parameter count stays modest since the text encoder remains frozen during training.",
          },
          { kind: "image", src: "/images/research/cips-net/qualitative.png", alt: "CIPS-Net qualitative segmentation results across tissue types" },
        ],
      },
      {
        heading: "Why we think this matters",
        blocks: [
          {
            kind: "paragraph",
            text: "None of this replaces a pathologist's judgment, and it was never meant to. The intention is narrower: reduce the amount of manual filtering a busy diagnostic workflow requires, and make the segmentation tool responsive to the specific question being asked rather than a fixed, one-size-fits-all output. CIPS-Net will be presented at the COMPAYL Workshop, MICCAI Society 2026, and the code will be released publicly alongside the paper.",
          },
        ],
      },
    ],
  },
  {
    slug: "ecg-free-cardiac-phase",
    title: "Speckle-Aware Signal Extraction as an Alternative to Complex Methods for ECG-Free Cardiac Phase Detection",
    venueBadge: { label: "MICCAI 2026", variant: "conf" },
    authors: [
      { text: "Nikhileswara Rao Sulake, " },
      { text: "Sai Manikanta Eswar Machara", bold: true },
      { text: ", Sivaji Retta, Iyyakutti Iyappan Ganapathi, Muhammad Owais, Irfan Hussain" },
    ],
    venue: "ASMUS Workshop, MICCAI Society 2026",
    thumbnail: "/images/research/ecg-free/hero.png",
    links: [],
    articleAuthors: [
      { name: "Nikhileswara Rao Sulake", href: "https://nikhil-rao20.github.io", affiliation: 1 },
      { name: "Sai Manikanta Eswar Machara", affiliation: 1 },
      { name: "Sivaji Retta", affiliation: 1 },
      { name: "Iyyakutti Iyappan Ganapathi", href: "https://scholar.google.com/citations?user=TMpGqLEAAAAJ&hl=en", affiliation: 2 },
      { name: "Muhammad Owais", affiliation: 2 },
      { name: "Irfan Hussain", affiliation: 2 },
    ],
    affiliations: [
      "Rajiv Gandhi University of Knowledge Technologies (RGUKT), IIIT Nuzvid, India",
      "Khalifa University of Science and Technology, Abu Dhabi, UAE",
    ],
    dateLabel: "Accepted 2026",
    deck:
      "Does more algorithmic complexity make ECG-free cardiac timing more accurate? Across 11,000+ echocardiography sequences, we found the opposite: a simple, speckle-aware signal beat every complex alternative we tested.",
    heroImage: "/images/research/ecg-free/hero.png",
    sections: [
      {
        heading: "A simple question about complexity",
        blocks: [
          {
            kind: "paragraph",
            text: "Echocardiography needs to know exactly when the heart is at end-diastole and end-systole, the two reference points that most cardiac measurements are built around. Normally an ECG signal provides that timing for free, but in point-of-care scanning, and in a lot of retrospective video data, no ECG trace is available at all. The field's working assumption has generally been that solving this without an ECG requires fairly sophisticated machinery: optical flow, Hilbert envelope analysis, multiple signal proxies fused together. We wanted to actually test that assumption rather than take it for granted.",
          },
        ],
      },
      {
        heading: "What ultrasound speckle does to these signals",
        blocks: [
          {
            kind: "paragraph",
            text: "Ultrasound images carry speckle, a granular interference pattern created by sound waves scattering off tissue smaller than the imaging resolution. It looks like noise, and a lot of ECG-free timing methods effectively try to average it away or work around it with more complex signal processing. Our approach does the opposite: it separates the speckle component from the underlying structural B-mode signal first, through a Gaussian decomposition, and then extracts a timing proxy from the clean structural component alone. Once speckle stops corrupting the signal, a much simpler extraction method turns out to work just as well as, or better than, the complicated ones built to compensate for it.",
          },
          {
            kind: "image",
            src: "/images/research/ecg-free/proxy_signal_intuition.png",
            alt: "Intuition behind the speckle-transparent proxy signal",
          },
        ],
      },
      {
        heading: "Testing it at scale",
        blocks: [
          {
            kind: "paragraph",
            text: "We evaluated this across two datasets rather than one: 1,000 sequences from CAMUS and just over 10,000 videos from EchoNet-Dynamic, more than 11,000 echocardiography sequences in total. We also built a formal random-baseline detector, expected to land around one third of the cardiac cycle length in error, so that every method's performance could be judged against a real floor rather than an arbitrary one.",
          },
        ],
      },
      {
        heading: "Where complexity actually hurt",
        blocks: [
          {
            kind: "paragraph",
            text: "The result surprised us a little, even though it is exactly what we set out to check. On CAMUS, the high-complexity configuration, the one combining optical flow with multi-proxy fusion, produced a median end-diastole error of 9.0 frames. Both our minimal-adaptive and speckle-transparent configurations landed at 1.0 frame. Digging into why, we found that optical flow error roughly doubles as speckle signal-to-noise ratio worsens across the dataset, a fairly direct confirmation that speckle interference, not a shortage of algorithmic sophistication, was the actual bottleneck the more complex methods were fighting.",
          },
          { kind: "image", src: "/images/research/ecg-free/speckle_mechanism.png", alt: "Optical flow error worsening with speckle compared to the stable intensity proxy" },
        ],
      },
      {
        heading: "What we take from this",
        blocks: [
          {
            kind: "paragraph",
            text: "We are not arguing that complex methods are never useful, only that for this specific problem, adding complexity on top of a signal still corrupted by speckle does not fix the underlying issue, and can make it worse. A simpler, physically grounded extraction step, done before any timing algorithm runs, turned out to matter more than the timing algorithm itself. This is our second paper accepted at an A*-ranked computer vision and medical imaging workshop, following DebrisVision at ICCV 2025, and it will be presented at the ASMUS Workshop, MICCAI Society 2026.",
          },
        ],
      },
    ],
  },
  {
    slug: "goose-m2f",
    title: "GOOSE-M2F: Adapting Mask2Former for High-Fidelity, Long-Tailed Fine-Grained Semantic Segmentation in Unstructured Outdoor Terrain",
    venueBadge: { label: "Preprint", variant: "preprint" },
    authors: [
      { text: "Jyothiraditya Lingam, Nikhileswara Rao Sulake, " },
      { text: "Sai Manikanta Eswar Machara", bold: true },
    ],
    venue: "GOOSE 2D FGSS Challenge, ICRA 2026 · Technical Report",
    thumbnail: "/images/research/goose-m2f/architecture.png",
    links: [{ label: "Code", href: "https://github.com/Aditya-Lingam-9000/GOOSE-M2F" }],
    articleAuthors: [
      { name: "Jyothiraditya Lingam", affiliation: 1 },
      { name: "Nikhileswara Rao Sulake", href: "https://nikhil-rao20.github.io", affiliation: 1 },
      { name: "Sai Manikanta Eswar Machara", affiliation: 1 },
    ],
    affiliations: ["Department of Computer Science and Engineering, Rajiv Gandhi University of Knowledge Technologies, Nuzvid, India"],
    dateLabel: "2026",
    deck:
      "64 fine-grained terrain classes, some occupying fewer than 50 pixels an image. Our Mask2Former adaptation placed 3rd on the GOOSE 2D leaderboard at 70.08% composite mIoU.",
    heroImage: "/images/research/goose-m2f/architecture.png",
    sections: [
      {
        heading: "A benchmark that refuses to be easy",
        blocks: [
          {
            kind: "paragraph",
            text: "The GOOSE 2D Fine-Grained Semantic Segmentation Challenge asks a model to label outdoor terrain into 64 separate classes, not the dozen or so categories most segmentation benchmarks use. Unstructured outdoor scenes make this harder still: trails, vegetation, and ground cover blend into each other, and a meaningful share of the 64 classes appear so rarely that some occupy fewer than 50 pixels in an entire image. Standard segmentation training tends to quietly abandon classes like these, since a network can get most of its loss down just by getting the big, common regions right.",
          },
        ],
      },
      {
        heading: "Extending Mask2Former for the long tail",
        blocks: [
          {
            kind: "paragraph",
            text: "We built on Mask2Former with a Swin-Large backbone and made three targeted changes rather than a full redesign. We expanded the number of object queries to 200, since the default query count saturates well before covering 64 distinct classes across a scene. We added a Feature Refinement Module that combines dilated convolutions with channel and spatial attention, giving the model more room to sharpen features for small, easily missed structures before they reach the transformer decoder. And we added an auxiliary per-pixel supervision head that runs only during training, feeding direct gradients back for rare classes that would otherwise get drowned out by the mask-level loss.",
          },
        ],
      },
      {
        heading: "Training and inference details that mattered",
        blocks: [
          {
            kind: "paragraph",
            text: "Architecture changes alone were not enough. We paired them with distribution-balanced loss weighting, rare-class copy-paste augmentation, dynamic IoU-aware re-weighting during training, and an exponential moving average of model weights. At inference time, a sliding-window pass with 2D Gaussian kernel blending and four-scale test-time augmentation added another 10.57 percentage points of composite mIoU on its own, one of the larger single contributions in the whole pipeline.",
          },
        ],
      },
      {
        heading: "Where GOOSE-M2F landed",
        blocks: [
          {
            kind: "paragraph",
            text: "The final system reached 70.08 percent official composite mIoU on the GOOSE 2D FGSS leaderboard, splitting into 63.55 percent on fine-grained classes and 76.61 percent on coarse ones, and placed third overall on the challenge. We wrote the approach up as a technical report and released the code and trained weights publicly, since a lot of the value in a long-tailed benchmark like this comes from other teams being able to build on what worked and what did not.",
          },
          { kind: "image", src: "/images/research/goose-m2f/qualitative.png", alt: "Qualitative GOOSE-M2F segmentation results on outdoor terrain scenes" },
        ],
      },
      {
        heading: "A note on the team",
        blocks: [
          {
            kind: "paragraph",
            text: "This project was a genuinely small team effort with Nikhileswara Rao Sulake and Jyothiraditya Lingam, who was still in his first year of engineering while this work was happening. Working alongside someone that early in their degree taking a challenge this seriously was, honestly, one of the more encouraging parts of the project.",
          },
        ],
      },
    ],
  },
  {
    slug: "debrisvision",
    title: "DebrisVision: Bridging the Synthetic-to-Real Gap for Enhanced Underwater Debris Analysis",
    paperHref:
      "https://openaccess.thecvf.com/content/ICCV2025W/CVAUI%20&%20AAMVEM/papers/Retta_DebrisVision_Bridging_the_Synthetic-to-Real_Gap_for_Enhanced_Underwater_Debris_Analysis_ICCVW_2025_paper.pdf",
    venueBadge: { label: "ICCV 2025", variant: "conf" },
    authors: [
      { text: "Sivaji Retta, " },
      { text: "Sai Manikanta Eswar Machara", bold: true },
      { text: ", Iyyakutti Iyappan Ganapathi, Divya Velayudhan, Naoufel Werghi" },
    ],
    venue: "International Conference on Computer Vision (CVAUI & AAMVEM Workshop), 2025",
    thumbnail: "/images/publications/debris_vision.png",
    links: [
      {
        label: "Paper",
        href: "https://openaccess.thecvf.com/content/ICCV2025W/CVAUI%20&%20AAMVEM/papers/Retta_DebrisVision_Bridging_the_Synthetic-to-Real_Gap_for_Enhanced_Underwater_Debris_Analysis_ICCVW_2025_paper.pdf",
      },
      { label: "Code", href: "https://github.com/EswarMachara/DebrisVision" },
    ],
    articleAuthors: [
      { name: "Sivaji Retta", affiliation: 1 },
      { name: "Sai Manikanta Eswar Machara", affiliation: 1 },
      { name: "Iyyakutti Iyappan Ganapathi", href: "https://scholar.google.com/citations?user=TMpGqLEAAAAJ&hl=en", affiliation: 2 },
      { name: "Divya Velayudhan", affiliation: 2 },
      { name: "Naoufel Werghi", affiliation: 2 },
    ],
    affiliations: ["RGUKT IIIT Nuzvid, India", "Khalifa University of Science and Technology, Abu Dhabi, UAE"],
    dateLabel: "ICCV 2025",
    deck:
      "Underwater debris detection has been held back by a shortage of large, well-annotated datasets. DebrisVision combines 9,430 real images with 15,570 synthetic ones, closes the gap between them, and roughly doubles detection accuracy for models trained on it.",
    heroImage: "/images/research/debrisvision/hero.png",
    sections: [
      {
        heading: "Why underwater debris is, at its core, a data problem",
        blocks: [
          {
            kind: "paragraph",
            text: "Over 14 million tons of plastic enter the ocean every year, and a large share of it eventually sinks to the seafloor, forming debris fields that entangle marine life and break down into microplastics that move up the food chain. Autonomous underwater vehicles and computer vision are a natural fit for detecting and eventually cleaning up this debris, but the models behind them run into a familiar wall: there simply are not enough large, diverse, precisely annotated underwater datasets to train them on.",
          },
          {
            kind: "paragraph",
            text: "The datasets that do exist tend to be small, geographically narrow, and skewed toward whatever debris is easiest to photograph. Rare but important categories, discarded fishing gear, metal containers, electronics, are consistently underrepresented, which biases detection models against exactly the objects that are often the most hazardous. On top of that, underwater conditions themselves shift constantly: turbidity, lighting, and occlusion all change what a camera sees from one dive to the next, and models trained on one set of conditions frequently fail to generalize to another.",
          },
        ],
      },
      {
        heading: "Building a hybrid, multi-modal dataset",
        blocks: [
          {
            kind: "paragraph",
            text: "DebrisVision combines 9,430 real-world underwater images with 15,570 synthetically generated ones, 25,000 images in total across 24 debris categories. Every image carries four kinds of annotation: bounding boxes, segmentation masks, depth maps, and a written text description, generated automatically using a pipeline of foundation models rather than hand-labeled one by one. Grounding DINO handles zero-shot detection from text prompts, Segment Anything produces the masks, Depth Anything V2 estimates depth, and InternVL2.5 writes the textual descriptions.",
          },
          {
            kind: "image",
            src: "/images/research/debrisvision/annotations.png",
            alt: "Example DebrisVision annotation: a plastic bag with its detection box, segmentation mask, and depth map",
            caption: "Every image in DebrisVision carries a bounding box, a segmentation mask, a depth map, and a text description, generated automatically rather than by hand.",
          },
          {
            kind: "paragraph",
            text: "Real-world underwater debris data is scarce for a lot of categories, so we filled the gaps with synthetic images generated from text-to-image diffusion models. We evaluated three candidates, Flux.1-dev, Sana, and Janus Pro, on realism and text alignment, and settled on Flux.1-dev with LoRA photorealism, since it produced the most convincing debris textures and the lowest Frechet Inception Distance against our real image set.",
          },
        ],
      },
      {
        heading: "Closing the synthetic-to-real gap",
        blocks: [
          {
            kind: "paragraph",
            text: "Synthetic images help with coverage, but a model trained purely on them tends to underperform on real footage, because even a photorealistic diffusion model does not perfectly reproduce underwater optics: light scattering, particulate haze, and the specific way water desaturates color at depth. To narrow that gap, we ran our synthetic images through FastCUT, an unpaired image-to-image translation method, which nudges the texture and lighting of synthetic debris toward what a real underwater camera would actually capture without needing paired synthetic-real examples to train on. This single step reduced the FID between our synthetic and real image distributions by 20 percent.",
          },
          {
            kind: "image",
            src: "/images/research/debrisvision/dataset_stats.png",
            alt: "DebrisVision dataset composition and class distribution charts",
            caption: "Synthetic augmentation meaningfully improves the balance of underrepresented classes like metal and biowaste debris, though plastics still dominate the overall distribution.",
          },
        ],
      },
      {
        heading: "What the numbers show",
        blocks: [
          {
            kind: "paragraph",
            text: "We benchmarked DebrisVision by fine-tuning a range of detection and segmentation models, YOLOv8, YOLO11, DETR, RTDETR, and YOLO12 for detection, and YOLOv8, YOLO11, FPN, SegFormer, UNet, UNet++, and DeepLabV3+ for segmentation, across different combinations of real, synthetic, and domain-adapted synthetic data. The pattern was consistent: adding domain-adapted synthetic data on top of real data outperformed training on real data alone by a wide margin. YOLOv8 improved by 2.29 times on detection mAP50 and 3.03 times on segmentation mAP50; YOLO11 improved by 2.01 times and 2.62 times respectively. Synthetic data alone was not enough, and real data alone was not enough either. It was the combination, with the domain gap closed, that made the difference.",
          },
        ],
      },
      {
        heading: "Teaching a model to describe debris, not just box it",
        blocks: [
          {
            kind: "paragraph",
            text: "Since every image in DebrisVision already carries a text description, we used that pairing to fine-tune CLIP into what we call DebrisCLIP. The result is a model that can classify debris from a free-text query without retraining, and retrieve images by description with noticeably better precision than the base CLIP model, particularly on the ambiguous, low-contrast cases where general-purpose CLIP tends to guess wrong. It is a smaller contribution than the dataset itself, but it is a fairly direct demonstration that multi-modal annotation pays for itself beyond just detection and segmentation.",
          },
        ],
      },
      {
        heading: "What is still unresolved",
        blocks: [
          {
            kind: "paragraph",
            text: "Class imbalance is reduced by DebrisVision, not eliminated. Categories like electronics waste remain underrepresented even after synthetic augmentation, and the domain gap between synthetic and real images, while narrower, has not closed completely. Our depth maps also come from a monocular estimator without any sensor-based validation, so they should be read as reasonable approximations rather than ground truth. We see the current 25,000-image release as a starting point rather than a finished benchmark, and the next steps we have in mind, scaling toward 100,000 images and validating depth against real sensors, are meant to close exactly these gaps.",
          },
        ],
      },
      {
        heading: "Why we built this",
        blocks: [
          {
            kind: "paragraph",
            text: "None of this is useful unless other people can build on it, so DebrisVision, the code, and the trained models are open-sourced. The goal was never just a benchmark number. Autonomous marine cleanup, robotic navigation around debris fields, and long-term ecological monitoring all depend on models that can actually recognize what they are looking at underwater, and that starts with a dataset that reflects what is really down there. This work was presented at the CVAUI & AAMVEM Workshop, ICCV 2025.",
          },
        ],
      },
    ],
  },
];

export function getPublication(slug: string): Publication | undefined {
  return publications.find((publication) => publication.slug === slug);
}

export interface OngoingResearchItem {
  title: string;
  description: string;
}

export const ongoingResearch: OngoingResearchItem[] = [
  {
    title: "Cross-Site OCT Generalization",
    description:
      "Working at TANUH, IISc Bangalore, under Prof. Phaneendra K. Yalavarthy, on domain generalization for retinal Optical Coherence Tomography, so that models trained on one scanner and clinical site continue to hold up reliably on another, a key barrier to deploying OCT-based screening at scale.",
  },
  {
    title: "eGFR from Renal Ultrasound",
    description:
      "Working at TANUH, IISc Bangalore, on estimating eGFR (glomerular filtration rate) directly from kidney ultrasound images, with the resulting estimate serving as a physiological biometric for insurance and risk-assessment use cases.",
  },
  {
    title: "KFRE Recalibration for Indian Cohorts",
    description:
      "Working at TANUH, IISc Bangalore, on recalibrating the Kidney Failure Risk Equation for Indian CKD populations, whose demographics and disease patterns are underrepresented in the equation's original validation, to enable more reliable 2- and 5-year kidney-failure risk prediction.",
  },
  {
    title: "PDS with H&E slides",
    description:
      "Working with Prof. Yanding Zhao (Computational Biology, MBZUAI) on predicting the P53 Deficiency Score (PDS) of breast cancer patients using H&E stained histopathology slides, to improve prognostic accuracy and treatment planning.",
  },
];

export interface Competition {
  rank: string;
  /** Left unset until a source link (LinkedIn post, results page, etc.) is confirmed. */
  rankHref?: string;
  name: RichText;
}

export const competitions: Competition[] = [
  {
    rank: "Top 2 (Runner-up)",
    name: [
      { text: "Problem Statement 3: Document Forgery & Deepfake Detection, " },
      { text: "AB PM-JAY Auto-Adjudication Hackathon 2026", href: "https://nha.gov.in/hackathon" },
      { text: ", National Health Authority (NHA) with IndiaAI and IISc" },
    ],
  },
  {
    rank: "Top 3",
    name: [{ text: "GOOSE 2D Fine-Grained Semantic Segmentation Challenge, ICRA 2026" }],
  },
  {
    rank: "Top 10",
    rankHref:
      "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_presentation-of-team-csosen-activity-7409841477511622656-tLNB/?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
    name: [
      { text: "Track 1, IEEE EMBS " },
      { text: "Biomedical & Health Informatics", href: "https://bhi.embs.org/2025/" },
      { text: " (BHI) Conference Data Competition, 2025" },
    ],
  },
  {
    rank: "Top 22",
    rankHref:
      "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_hackathon-teammate-international-activity-7274379337334763520-7MN7?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
    name: [
      { text: "Multimodal AI4TB Challenge (MAIC), " },
      { text: "Seoul National University Hospital", href: "http://www.snuh.org/global/en/main.do" },
      { text: ", 2024" },
    ],
  },
  {
    rank: "Top 3",
    rankHref:
      "https://www.linkedin.com/posts/sai-manikanta-eswar-machara_knowledge-ai-research-activity-7280185753156956160-Oikq?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEq6X-EBaf7NE8cpnGRIqbGf4tCm3ACoE04",
    name: [
      { text: "Intel AI Hackathon 2024, IEEE Indicon", href: "https://ieeeindicon.org/" },
      { text: " at IIT Kharagpur, 2024" },
    ],
  },
];
