'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Moon, Sun, Heart, Share2, Check, Clock, Star,
  ChevronDown, ChevronUp, Sparkles, Home, Bath, Bed, Sofa, Shirt,
  Briefcase, Calendar, ShoppingCart, Printer, X, Tag, Leaf, DollarSign,
  PawPrint, AlertCircle, Droplet, Wind, Thermometer, Award, TrendingUp,
  BookOpen, Download, CheckCircle, BarChart3
} from 'lucide-react';

// Comprehensive Cleaning Tips Data
const cleaningTipsData = [
  // KITCHEN TIPS
  {
    id: 'k1',
    title: 'Deep Clean Your Refrigerator',
    room: 'kitchen',
    type: 'deep',
    difficulty: 'medium',
    time: 45,
    frequency: 'monthly',
    tags: ['eco-friendly', 'allergen-free'],
    icon: '🧊',
    rating: 4.8,
    steps: [
      'Remove all food items and check expiration dates',
      'Take out removable shelves and drawers',
      'Mix 2 tbsp baking soda with 1 quart warm water',
      'Wipe down all interior surfaces with the solution',
      'Clean shelves and drawers in sink with dish soap',
      'Wipe door seals and handles with disinfectant',
      'Dry everything thoroughly before replacing',
      'Organize food by category as you put items back'
    ],
    supplies: ['Baking soda', 'Warm water', 'Microfiber cloths', 'Dish soap', 'All-purpose cleaner'],
    proTip: 'Place an open box of baking soda in the back to absorb odors. Replace every 3 months for best results.',
    relatedTips: ['k2', 'k3']
  },
  {
    id: 'k2',
    title: 'Microwave Steam Clean',
    room: 'kitchen',
    type: 'quick',
    difficulty: 'easy',
    time: 10,
    frequency: 'weekly',
    tags: ['eco-friendly', 'budget-friendly'],
    icon: '🍋',
    rating: 4.9,
    steps: [
      'Fill microwave-safe bowl with 1 cup water',
      'Add lemon slices or 2 tbsp vinegar',
      'Microwave on high for 3-5 minutes',
      'Let stand for 2 minutes with door closed',
      'Carefully remove bowl (it will be hot!)',
      'Wipe down interior with damp cloth',
      'Clean turntable separately in sink'
    ],
    supplies: ['Lemon or white vinegar', 'Microwave-safe bowl', 'Cloth'],
    proTip: 'The steam loosens dried food, making it wipe away effortlessly. Do this before stubborn stains set.',
    relatedTips: ['k1', 'k4']
  },
  {
    id: 'k3',
    title: 'Degrease Kitchen Cabinets',
    room: 'kitchen',
    type: 'deep',
    difficulty: 'medium',
    time: 60,
    frequency: 'quarterly',
    tags: ['deep-clean'],
    icon: '🚪',
    rating: 4.6,
    steps: [
      'Mix 1 cup warm water with 2 tbsp dish soap',
      'Test solution on hidden area first',
      'Dip cloth in solution and wring out well',
      'Wipe cabinet doors from top to bottom',
      'Pay special attention to handles and edges',
      'Rinse with clean damp cloth',
      'Dry immediately with microfiber cloth',
      'Apply wood polish if applicable'
    ],
    supplies: ['Dish soap', 'Warm water', 'Microfiber cloths', 'Wood polish (optional)'],
    proTip: 'For tough grease, make a paste with baking soda and water. Gently scrub, then wipe clean.',
    relatedTips: ['k1', 'k5']
  },
  {
    id: 'k4',
    title: 'Sparkling Stainless Steel Appliances',
    room: 'kitchen',
    type: 'quick',
    difficulty: 'easy',
    time: 15,
    frequency: 'weekly',
    tags: ['quick-tip'],
    icon: '✨',
    rating: 4.7,
    steps: [
      'Identify the grain direction of the steel',
      'Spray stainless steel cleaner or use vinegar',
      'Wipe with the grain using microfiber cloth',
      'Buff with dry cloth for streak-free shine',
      'For fingerprints, use a tiny amount of mineral oil'
    ],
    supplies: ['Stainless steel cleaner or vinegar', 'Microfiber cloths', 'Mineral oil (optional)'],
    proTip: 'Always wipe WITH the grain, never against it. This prevents scratches and ensures a perfect shine.',
    relatedTips: ['k2', 'k6']
  },
  {
    id: 'k5',
    title: 'Dishwasher Deep Clean',
    room: 'kitchen',
    type: 'deep',
    difficulty: 'easy',
    time: 30,
    frequency: 'monthly',
    tags: ['eco-friendly', 'allergen-free'],
    icon: '🍽️',
    rating: 4.8,
    steps: [
      'Remove and clean the filter under hot water',
      'Check spray arms for clogs, clear with toothpick',
      'Wipe door edges and seals with damp cloth',
      'Place cup of white vinegar on top rack',
      'Run hot water cycle (no dishes)',
      'Sprinkle 1 cup baking soda on bottom',
      'Run short hot cycle for fresh smell'
    ],
    supplies: ['White vinegar', 'Baking soda', 'Old toothbrush', 'Cloth'],
    proTip: 'Clean your dishwasher monthly to prevent buildup and keep dishes sparkling. A clean dishwasher = cleaner dishes!',
    relatedTips: ['k1', 'k3']
  },
  {
    id: 'k6',
    title: 'Garbage Disposal Refresh',
    room: 'kitchen',
    type: 'quick',
    difficulty: 'easy',
    time: 5,
    frequency: 'weekly',
    tags: ['eco-friendly', 'budget-friendly'],
    icon: '🍊',
    rating: 4.9,
    steps: [
      'Cut lemon or orange into small pieces',
      'Turn on cold water and disposal',
      'Drop citrus pieces into disposal',
      'Run for 30 seconds',
      'Follow with ice cubes to sharpen blades',
      'Flush with cold water for 30 seconds'
    ],
    supplies: ['Citrus peels', 'Ice cubes'],
    proTip: 'Never put grease, bones, or fibrous vegetables down the disposal. Citrus keeps it fresh and clean!',
    relatedTips: ['k2', 'k4']
  },

  // BATHROOM TIPS
  {
    id: 'b1',
    title: 'Toilet Deep Clean & Sanitize',
    room: 'bathroom',
    type: 'deep',
    difficulty: 'easy',
    time: 20,
    frequency: 'weekly',
    tags: ['allergen-free'],
    icon: '🚽',
    rating: 4.7,
    steps: [
      'Pour 1 cup baking soda into bowl',
      'Add 1 cup white vinegar (it will fizz)',
      'Let sit for 30 minutes',
      'Scrub bowl with toilet brush',
      'Clean under rim thoroughly',
      'Wipe exterior, seat, and base with disinfectant',
      'Don\'t forget the flush handle!',
      'Flush and admire your sparkling toilet'
    ],
    supplies: ['Baking soda', 'White vinegar', 'Toilet brush', 'Disinfectant', 'Gloves'],
    proTip: 'For tough stains, leave the baking soda/vinegar mixture overnight before scrubbing.',
    relatedTips: ['b2', 'b3']
  },
  {
    id: 'b2',
    title: 'Shower & Tub Tile Grout Cleaning',
    room: 'bathroom',
    type: 'deep',
    difficulty: 'medium',
    time: 45,
    frequency: 'monthly',
    tags: ['deep-clean'],
    icon: '🚿',
    rating: 4.6,
    steps: [
      'Make paste: 3 parts baking soda, 1 part water',
      'Apply paste to grout lines with old toothbrush',
      'Let sit for 15 minutes',
      'Spray with vinegar (it will fizz)',
      'Scrub grout lines with brush',
      'Rinse thoroughly with warm water',
      'Dry with towel to prevent water spots',
      'Apply grout sealer for protection (optional)'
    ],
    supplies: ['Baking soda', 'White vinegar', 'Old toothbrush', 'Spray bottle', 'Towel', 'Grout sealer (optional)'],
    proTip: 'For mildew stains, add a few drops of tea tree oil to your cleaning solution. Natural antifungal!',
    relatedTips: ['b1', 'b4']
  },
  {
    id: 'b3',
    title: 'Mirror & Glass Streak-Free Shine',
    room: 'bathroom',
    type: 'quick',
    difficulty: 'easy',
    time: 10,
    frequency: 'weekly',
    tags: ['eco-friendly', 'budget-friendly'],
    icon: '🪞',
    rating: 4.8,
    steps: [
      'Mix equal parts white vinegar and water in spray bottle',
      'Spray mirror lightly (don\'t oversaturate)',
      'Wipe in S-pattern with microfiber cloth',
      'Buff with dry newspaper for extra shine',
      'Clean frame and edges with damp cloth'
    ],
    supplies: ['White vinegar', 'Water', 'Spray bottle', 'Microfiber cloth', 'Newspaper'],
    proTip: 'Use newspaper for the final buff - it leaves no lint and gives an incredible streak-free shine!',
    relatedTips: ['b4', 'b5']
  },
  {
    id: 'b4',
    title: 'Showerhead Descale',
    room: 'bathroom',
    type: 'quick',
    difficulty: 'easy',
    time: 15,
    frequency: 'monthly',
    tags: ['eco-friendly', 'budget-friendly'],
    icon: '💧',
    rating: 4.9,
    steps: [
      'Fill plastic bag with white vinegar',
      'Secure bag over showerhead with rubber band',
      'Ensure showerhead is submerged in vinegar',
      'Let soak for 2-3 hours (or overnight for heavy buildup)',
      'Remove bag and discard vinegar',
      'Turn on shower to rinse',
      'Wipe clean with cloth',
      'Use old toothbrush for any remaining deposits'
    ],
    supplies: ['White vinegar', 'Plastic bag', 'Rubber band', 'Old toothbrush'],
    proTip: 'Do this every month in hard water areas to maintain water pressure and even spray pattern.',
    relatedTips: ['b2', 'b6']
  },
  {
    id: 'b5',
    title: 'Bathroom Exhaust Fan Cleaning',
    room: 'bathroom',
    type: 'deep',
    difficulty: 'medium',
    time: 30,
    frequency: 'quarterly',
    tags: ['allergen-free', 'deep-clean'],
    icon: '🌪️',
    rating: 4.5,
    steps: [
      'Turn off power at circuit breaker',
      'Remove fan cover (usually clips or screws)',
      'Vacuum dust from cover and fan blades',
      'Wash cover in warm soapy water',
      'Wipe fan blades with damp cloth',
      'Clean motor housing (avoid getting motor wet)',
      'Dry cover completely',
      'Reinstall and restore power'
    ],
    supplies: ['Vacuum with brush attachment', 'Dish soap', 'Microfiber cloths', 'Screwdriver (if needed)'],
    proTip: 'A clean exhaust fan prevents mold and mildew by properly ventilating your bathroom. Test monthly!',
    relatedTips: ['b1', 'b2']
  },
  {
    id: 'b6',
    title: 'Sink & Faucet Polish',
    room: 'bathroom',
    type: 'quick',
    difficulty: 'easy',
    time: 10,
    frequency: 'weekly',
    tags: ['quick-tip'],
    icon: '🚰',
    rating: 4.7,
    steps: [
      'Spray sink with all-purpose cleaner',
      'Scrub with sponge, paying attention to faucet base',
      'For chrome, use vinegar solution for water spots',
      'Rinse thoroughly with warm water',
      'Dry completely with microfiber cloth',
      'Polish faucet with dry cloth for shine',
      'Don\'t forget the overflow drain!'
    ],
    supplies: ['All-purpose cleaner', 'Sponge', 'White vinegar', 'Microfiber cloths'],
    proTip: 'Dry your sink and faucet after each use to prevent water spots and keep them shining longer.',
    relatedTips: ['b3', 'b4']
  },

  // BEDROOM TIPS
  {
    id: 'br1',
    title: 'Mattress Deep Clean & Deodorize',
    room: 'bedroom',
    type: 'deep',
    difficulty: 'medium',
    time: 60,
    frequency: 'quarterly',
    tags: ['allergen-free', 'deep-clean'],
    icon: '🛏️',
    rating: 4.8,
    steps: [
      'Strip all bedding and wash in hot water',
      'Vacuum entire mattress surface and sides',
      'Sprinkle baking soda liberally over entire surface',
      'Let sit for at least 1 hour (longer for odors)',
      'Vacuum up all baking soda thoroughly',
      'Spot clean stains with enzyme cleaner',
      'Let air dry completely',
      'Flip or rotate mattress',
      'Make bed with clean, fresh bedding'
    ],
    supplies: ['Vacuum with upholstery attachment', 'Baking soda', 'Enzyme cleaner', 'Clean bedding'],
    proTip: 'Add a few drops of lavender essential oil to baking soda for a calming scent. Vacuum on a sunny day!',
    relatedTips: ['br2', 'br3']
  },
  {
    id: 'br2',
    title: 'Dust & Organize Closet',
    room: 'bedroom',
    type: 'deep',
    difficulty: 'medium',
    time: 90,
    frequency: 'seasonally',
    tags: ['allergen-free', 'deep-clean'],
    icon: '👔',
    rating: 4.6,
    steps: [
      'Remove everything from closet',
      'Vacuum or sweep floor',
      'Wipe down shelves and hanging rods',
      'Clean baseboards and corners',
      'Sort clothing: keep, donate, discard',
      'Organize by category and color',
      'Use matching hangers for uniform look',
      'Add sachets or cedar blocks for freshness',
      'Place only clean, seasonal items back'
    ],
    supplies: ['Vacuum', 'Microfiber cloths', 'All-purpose cleaner', 'Matching hangers', 'Storage bins'],
    proTip: 'Follow the "one year rule" - if you haven\'t worn it in a year, donate it. Keep only what you love!',
    relatedTips: ['br1', 'br4']
  },
  {
    id: 'br3',
    title: 'Ceiling Fan & Light Fixture Cleaning',
    room: 'bedroom',
    type: 'quick',
    difficulty: 'easy',
    time: 15,
    frequency: 'monthly',
    tags: ['allergen-free', 'quick-tip'],
    icon: '💨',
    rating: 4.7,
    steps: [
      'Turn off fan and let blades stop completely',
      'Place old pillowcase over each blade',
      'Pull pillowcase back, trapping dust inside',
      'Repeat for all blades',
      'Wipe motor housing with damp cloth',
      'Clean light fixtures with glass cleaner',
      'Shake out pillowcase outside',
      'Toss pillowcase in wash'
    ],
    supplies: ['Old pillowcase', 'Damp cloth', 'Glass cleaner', 'Step stool'],
    proTip: 'The pillowcase trick contains dust so it doesn\'t fall on your bed. Clean fans monthly to improve air quality!',
    relatedTips: ['br1', 'br5']
  },
  {
    id: 'br4',
    title: 'Baseboards & Crown Molding Detailing',
    room: 'bedroom',
    type: 'deep',
    difficulty: 'medium',
    time: 40,
    frequency: 'monthly',
    tags: ['allergen-free'],
    icon: '📐',
    rating: 4.5,
    steps: [
      'Vacuum baseboards with brush attachment first',
      'Fill bucket with warm water and dish soap',
      'Dampen microfiber cloth in solution',
      'Wipe baseboards from one end to other',
      'Use old toothbrush for corners and crevices',
      'Wipe crown molding with extendable duster',
      'Dry with clean cloth to prevent water marks',
      'Touch up scuff marks with Magic Eraser'
    ],
    supplies: ['Vacuum', 'Bucket', 'Dish soap', 'Microfiber cloths', 'Old toothbrush', 'Extendable duster', 'Magic Eraser'],
    proTip: 'Use a dryer sheet to wipe baseboards after cleaning - it repels dust and keeps them cleaner longer!',
    relatedTips: ['br2', 'br6']
  },
  {
    id: 'br5',
    title: 'Window Treatment Refresh',
    room: 'bedroom',
    type: 'quick',
    difficulty: 'easy',
    time: 20,
    frequency: 'monthly',
    tags: ['allergen-free', 'quick-tip'],
    icon: '🪟',
    rating: 4.6,
    steps: [
      'Vacuum curtains/drapes with upholstery attachment',
      'Check care labels for washing instructions',
      'Steam or iron wrinkles if fabric-safe',
      'For blinds, close slats and dust with microfiber cloth',
      'Flip blinds, close opposite direction, repeat',
      'Spot clean stains with appropriate cleaner',
      'Open windows for fresh air circulation'
    ],
    supplies: ['Vacuum', 'Microfiber cloth', 'Steamer or iron', 'Spot cleaner'],
    proTip: 'Most curtains can be freshened in the dryer on low heat with a damp towel for 15 minutes. Check labels first!',
    relatedTips: ['br3', 'br6']
  },
  {
    id: 'br6',
    title: 'Under-Bed Deep Clean',
    room: 'bedroom',
    type: 'deep',
    difficulty: 'easy',
    time: 25,
    frequency: 'quarterly',
    tags: ['allergen-free', 'deep-clean'],
    icon: '🧹',
    rating: 4.7,
    steps: [
      'Move bed away from wall if possible',
      'Remove all items from under bed',
      'Vacuum thoroughly, including corners',
      'Wipe floor with damp mop or cloth',
      'Clean or dust any storage containers',
      'Vacuum bed frame and slats',
      'Organize items before returning',
      'Use under-bed organizers for easy access'
    ],
    supplies: ['Vacuum', 'Mop or damp cloth', 'Storage organizers'],
    proTip: 'Place items in clear, labeled bins for easy identification. Avoid storing items directly on floor - use bins!',
    relatedTips: ['br1', 'br2']
  },

  // LIVING ROOM TIPS
  {
    id: 'l1',
    title: 'Upholstery & Couch Deep Clean',
    room: 'living',
    type: 'deep',
    difficulty: 'medium',
    time: 60,
    frequency: 'quarterly',
    tags: ['allergen-free', 'pet-friendly'],
    icon: '🛋️',
    rating: 4.8,
    steps: [
      'Check furniture tag for cleaning code (W, S, W/S, or X)',
      'Vacuum entire surface with upholstery attachment',
      'Remove cushion covers if washable',
      'Mix cleaning solution based on cleaning code',
      'Test on hidden area first',
      'Apply cleaner with soft brush or cloth',
      'Blot (don\'t rub) stains gently',
      'Allow to air dry completely',
      'Vacuum again once dry',
      'Fluff cushions and reassemble'
    ],
    supplies: ['Vacuum', 'Upholstery cleaner', 'Soft brush', 'Microfiber cloths', 'Fan for drying'],
    proTip: 'W=water-based, S=solvent, W/S=either, X=vacuum only. Always test cleaners first! Sprinkle baking soda before vacuuming to deodorize.',
    relatedTips: ['l2', 'l3']
  },
  {
    id: 'l2',
    title: 'TV & Electronics Dust-Free',
    room: 'living',
    type: 'quick',
    difficulty: 'easy',
    time: 15,
    frequency: 'weekly',
    tags: ['quick-tip'],
    icon: '📺',
    rating: 4.7,
    steps: [
      'Turn off and unplug all electronics',
      'Use microfiber cloth (dry) for screens',
      'Never spray liquid directly on screens',
      'Wipe in gentle circular motions',
      'Use compressed air for vents and ports',
      'Clean remote controls with disinfecting wipe',
      'Organize and dust cables',
      'Wipe down TV stand or entertainment center'
    ],
    supplies: ['Microfiber cloths', 'Compressed air', 'Disinfecting wipes', 'Screen cleaner (optional)'],
    proTip: 'Dryer sheets are great for dusting electronics - they reduce static and repel dust longer!',
    relatedTips: ['l1', 'l4']
  },
  {
    id: 'l3',
    title: 'Carpet Deep Clean & Stain Removal',
    room: 'living',
    type: 'deep',
    difficulty: 'medium',
    time: 90,
    frequency: 'seasonally',
    tags: ['allergen-free', 'pet-friendly', 'deep-clean'],
    icon: '🧼',
    rating: 4.6,
    steps: [
      'Vacuum thoroughly in multiple directions',
      'Pre-treat stains with appropriate cleaner',
      'Test carpet cleaner on inconspicuous area',
      'Use carpet cleaning machine or hire professional',
      'Work in sections, overlapping strokes',
      'Don\'t over-wet carpet',
      'Open windows and use fans to dry faster',
      'Vacuum again once completely dry',
      'Apply carpet protector if desired'
    ],
    supplies: ['Vacuum', 'Carpet cleaner machine', 'Carpet cleaning solution', 'Stain remover', 'Fans'],
    proTip: 'For pet stains, use enzyme cleaner to break down odors. Blot spills immediately - never rub, as it spreads the stain!',
    relatedTips: ['l1', 'l6']
  },
  {
    id: 'l4',
    title: 'Bookshelf & Décor Dusting',
    room: 'living',
    type: 'quick',
    difficulty: 'easy',
    time: 30,
    frequency: 'bi-weekly',
    tags: ['allergen-free', 'quick-tip'],
    icon: '📚',
    rating: 4.5,
    steps: [
      'Remove all items from one shelf at a time',
      'Vacuum or dust shelf surface',
      'Wipe with damp microfiber cloth',
      'Dust each item before returning',
      'For books, use dry cloth or vacuum with brush',
      'Organize as you go for fresh look',
      'Don\'t forget shelf tops and sides',
      'Vacuum floor beneath bookshelf'
    ],
    supplies: ['Microfiber cloths', 'Vacuum with brush attachment', 'All-purpose cleaner'],
    proTip: 'Dust books from spine to edge to keep dust from settling between pages. Organize by color for visual impact!',
    relatedTips: ['l2', 'l5']
  },
  {
    id: 'l5',
    title: 'Window Washing Inside & Out',
    room: 'living',
    type: 'deep',
    difficulty: 'medium',
    time: 45,
    frequency: 'seasonally',
    tags: ['eco-friendly', 'deep-clean'],
    icon: '🪟',
    rating: 4.7,
    steps: [
      'Remove window screens and wash separately',
      'Vacuum window tracks and sills',
      'Mix solution: 1 part vinegar, 4 parts water',
      'Spray windows generously',
      'Wipe in S-pattern with squeegee',
      'Dry edges with microfiber cloth',
      'Clean window frames and sills',
      'Replace clean screens',
      'Step outside and repeat on exterior'
    ],
    supplies: ['White vinegar', 'Spray bottle', 'Squeegee', 'Microfiber cloths', 'Vacuum', 'Bucket'],
    proTip: 'Clean windows on cloudy days - direct sunlight causes streaking. Use newspaper for final polish for crystal-clear results!',
    relatedTips: ['l4', 'l6']
  },
  {
    id: 'l6',
    title: 'Coffee Table & Surfaces Detailing',
    room: 'living',
    type: 'quick',
    difficulty: 'easy',
    time: 10,
    frequency: 'daily',
    tags: ['quick-tip', 'budget-friendly'],
    icon: '☕',
    rating: 4.6,
    steps: [
      'Clear all items from surface',
      'Dust with microfiber cloth',
      'Spray appropriate cleaner for surface type',
      'Wipe in direction of wood grain if applicable',
      'Buff dry for streak-free finish',
      'Clean and arrange items before returning',
      'Use coasters to prevent future rings',
      'Polish wood surfaces monthly'
    ],
    supplies: ['Microfiber cloths', 'Appropriate cleaner for surface', 'Wood polish (if applicable)'],
    proTip: 'For water rings on wood, rub gently with mayo or toothpaste, then buff clean. Prevention is key - use coasters!',
    relatedTips: ['l1', 'l4']
  },

  // LAUNDRY TIPS
  {
    id: 'la1',
    title: 'Washing Machine Deep Clean',
    room: 'laundry',
    type: 'deep',
    difficulty: 'easy',
    time: 40,
    frequency: 'monthly',
    tags: ['eco-friendly', 'allergen-free'],
    icon: '🧺',
    rating: 4.9,
    steps: [
      'Run empty cycle with 2 cups white vinegar (hot water)',
      'Pause mid-cycle and let sit for 30 minutes',
      'While waiting, clean detergent dispenser',
      'Wipe door seal and remove any debris',
      'Resume and complete vinegar cycle',
      'Run second empty cycle with 1 cup baking soda',
      'Wipe drum, door, and exterior dry',
      'Leave door open to air dry and prevent mildew'
    ],
    supplies: ['White vinegar', 'Baking soda', 'Microfiber cloths', 'Old toothbrush'],
    proTip: 'Clean monthly to prevent mildew smell. Always leave washer door open between loads to air out!',
    relatedTips: ['la2', 'la3']
  },
  {
    id: 'la2',
    title: 'Dryer Vent Cleaning (Fire Prevention)',
    room: 'laundry',
    type: 'deep',
    difficulty: 'medium',
    time: 30,
    frequency: 'quarterly',
    tags: ['deep-clean', 'safety'],
    icon: '🔥',
    rating: 5.0,
    steps: [
      'Unplug dryer and pull away from wall',
      'Disconnect vent hose from dryer',
      'Remove lint from hose with vent brush',
      'Vacuum inside vent opening in wall',
      'Clean dryer lint trap thoroughly',
      'Vacuum inside dryer lint trap cavity',
      'Reconnect vent hose securely',
      'Test dryer to ensure proper airflow'
    ],
    supplies: ['Dryer vent brush kit', 'Vacuum with hose attachment', 'Screwdriver'],
    proTip: 'Clogged dryer vents cause 15,000+ house fires yearly! Clean quarterly and always empty lint trap after each load.',
    relatedTips: ['la1', 'la4']
  },
  {
    id: 'la3',
    title: 'Iron & Ironing Board Maintenance',
    room: 'laundry',
    type: 'quick',
    difficulty: 'easy',
    time: 15,
    frequency: 'monthly',
    tags: ['quick-tip'],
    icon: '👔',
    rating: 4.5,
    steps: [
      'Unplug iron and let cool completely',
      'Mix equal parts vinegar and water',
      'Fill iron reservoir with solution',
      'Turn to steam setting and iron old towel',
      'Empty reservoir and rinse with clean water',
      'Wipe soleplate with damp cloth',
      'For stuck residue, use baking soda paste',
      'Wipe ironing board cover or wash if removable'
    ],
    supplies: ['White vinegar', 'Baking soda', 'Microfiber cloths', 'Old towel'],
    proTip: 'Prevent mineral buildup by using distilled water. Clean soleplate regularly for smooth gliding and no transfer!',
    relatedTips: ['la1', 'la5']
  },
  {
    id: 'la4',
    title: 'Stain Removal Guide',
    room: 'laundry',
    type: 'quick',
    difficulty: 'easy',
    time: 10,
    frequency: 'as-needed',
    tags: ['budget-friendly', 'eco-friendly'],
    icon: '🎨',
    rating: 4.8,
    steps: [
      'Identify stain type (protein, oil, tannin, dye)',
      'Blot (don\'t rub) fresh stains immediately',
      'For protein stains: cold water + enzyme detergent',
      'For oil stains: dish soap, then hot water wash',
      'For tannins: soak in cold water, apply stain remover',
      'For dye: color-safe bleach or vinegar soak',
      'Pre-treat 15 minutes before washing',
      'Check before drying - heat sets stains!',
      'Repeat if needed - never dry until gone'
    ],
    supplies: ['Enzyme detergent', 'Dish soap', 'Stain remover', 'White vinegar', 'Color-safe bleach'],
    proTip: 'Act fast! Fresh stains come out easier. Never put stained items in dryer - heat permanently sets stains.',
    relatedTips: ['la3', 'la5']
  },
  {
    id: 'la5',
    title: 'Organize Laundry Room',
    room: 'laundry',
    type: 'deep',
    difficulty: 'medium',
    time: 60,
    frequency: 'seasonally',
    tags: ['organization'],
    icon: '📦',
    rating: 4.6,
    steps: [
      'Remove everything from laundry room',
      'Discard expired or empty products',
      'Wipe down all surfaces and shelves',
      'Sweep and mop floor',
      'Sort supplies by category',
      'Use clear bins or baskets for organization',
      'Label all containers clearly',
      'Install hooks for hanging items',
      'Create sorting system for laundry',
      'Keep frequently used items at eye level'
    ],
    supplies: ['Storage bins', 'Labels', 'Hooks', 'All-purpose cleaner', 'Microfiber cloths'],
    proTip: 'Create a "lost sock" basket and match them monthly. Sort laundry directly into labeled baskets (whites, colors, delicates).',
    relatedTips: ['la1', 'la2']
  },
  {
    id: 'la6',
    title: 'Fresh-Smelling Laundry Secrets',
    room: 'laundry',
    type: 'quick',
    difficulty: 'easy',
    time: 5,
    frequency: 'weekly',
    tags: ['eco-friendly', 'budget-friendly'],
    icon: '🌸',
    rating: 4.7,
    steps: [
      'Don\'t overload washer - clothes need room to move',
      'Use correct amount of detergent (less is more!)',
      'Add 1/2 cup white vinegar to rinse cycle',
      'Remove clothes from washer immediately',
      'Shake out items before putting in dryer',
      'Add wool dryer balls with essential oil drops',
      'Don\'t over-dry clothes',
      'Fold immediately to prevent wrinkles and mustiness'
    ],
    supplies: ['White vinegar', 'Wool dryer balls', 'Essential oils (optional)'],
    proTip: 'Too much detergent causes buildup and odors! Use vinegar in rinse - it\'s a natural fabric softener and deodorizer.',
    relatedTips: ['la1', 'la4']
  },

  // OFFICE/WORKSPACE TIPS
  {
    id: 'o1',
    title: 'Desk Deep Clean & Organization',
    room: 'office',
    type: 'deep',
    difficulty: 'medium',
    time: 45,
    frequency: 'monthly',
    tags: ['organization', 'productivity'],
    icon: '💼',
    rating: 4.7,
    steps: [
      'Clear everything off desk surface',
      'Wipe down entire surface with all-purpose cleaner',
      'Clean monitor, keyboard, and mouse',
      'Organize drawers and remove unnecessary items',
      'Use drawer dividers for small items',
      'Wipe down office chair and wheels',
      'Vacuum under desk and chair mat',
      'Cable management for cords',
      'Return only essential items to desk',
      'Implement "one thing in, one thing out" rule'
    ],
    supplies: ['All-purpose cleaner', 'Microfiber cloths', 'Compressed air', 'Drawer organizers', 'Cable ties'],
    proTip: 'A clutter-free desk = a clear mind! Keep only today\'s essentials on your desk. File or store everything else.',
    relatedTips: ['o2', 'o3']
  },
  {
    id: 'o2',
    title: 'Keyboard & Mouse Sanitize',
    room: 'office',
    type: 'quick',
    difficulty: 'easy',
    time: 10,
    frequency: 'weekly',
    tags: ['allergen-free', 'quick-tip'],
    icon: '⌨️',
    rating: 4.8,
    steps: [
      'Unplug keyboard or turn off wireless',
      'Turn keyboard upside down and shake gently',
      'Use compressed air between keys',
      'Wipe keys with isopropyl alcohol on cloth',
      'Use cotton swab for tight spaces',
      'Clean mouse with alcohol wipe',
      'Don\'t forget mouse pad - wash or wipe',
      'Let everything dry before reconnecting'
    ],
    supplies: ['Compressed air', 'Isopropyl alcohol', 'Microfiber cloths', 'Cotton swabs'],
    proTip: 'Keyboards have more bacteria than toilet seats! Clean weekly and never eat over your keyboard.',
    relatedTips: ['o1', 'o4']
  },
  {
    id: 'o3',
    title: 'File Cabinet Organization',
    room: 'office',
    type: 'deep',
    difficulty: 'medium',
    time: 90,
    frequency: 'annually',
    tags: ['organization', 'deep-clean'],
    icon: '📁',
    rating: 4.5,
    steps: [
      'Remove all files and documents',
      'Vacuum inside drawers',
      'Wipe down drawer interiors',
      'Sort documents: keep, shred, scan',
      'Shred outdated sensitive documents',
      'Create clear filing system',
      'Use labeled hanging folders',
      'Organize alphabetically or by category',
      'Keep current year documents accessible',
      'Archive older files in separate drawer/box'
    ],
    supplies: ['Vacuum', 'All-purpose cleaner', 'Hanging folders', 'Labels', 'Shredder'],
    proTip: 'Go paperless when possible! Scan important documents and store digitally. Keep only 7 years of financial records.',
    relatedTips: ['o1', 'o5']
  },
  {
    id: 'o4',
    title: 'Monitor & Screen Cleaning',
    room: 'office',
    type: 'quick',
    difficulty: 'easy',
    time: 5,
    frequency: 'weekly',
    tags: ['quick-tip'],
    icon: '🖥️',
    rating: 4.6,
    steps: [
      'Turn off monitor and let cool',
      'Use dry microfiber cloth first',
      'For stubborn smudges, slightly dampen cloth',
      'Wipe in gentle circular motions',
      'Never spray directly on screen',
      'Use screen-specific cleaner if needed',
      'Dry with second clean microfiber cloth',
      'Wipe down monitor stand and base'
    ],
    supplies: ['Microfiber cloths', 'Screen cleaner (optional)', 'Distilled water'],
    proTip: 'Never use paper towels or harsh chemicals - they scratch screens! Microfiber is all you need for most cleaning.',
    relatedTips: ['o2', 'l2']
  },
  {
    id: 'o5',
    title: 'Office Chair Maintenance',
    room: 'office',
    type: 'deep',
    difficulty: 'medium',
    time: 30,
    frequency: 'quarterly',
    tags: ['maintenance'],
    icon: '🪑',
    rating: 4.6,
    steps: [
      'Vacuum chair thoroughly (seat, back, crevices)',
      'Check care label for fabric type',
      'Spot clean stains with upholstery cleaner',
      'Wipe down armrests and base',
      'Clean wheels and remove hair/debris',
      'Lubricate moving parts if squeaky',
      'Tighten any loose screws or bolts',
      'Adjust height and tilt for ergonomics',
      'Let fabric dry completely before use'
    ],
    supplies: ['Vacuum', 'Upholstery cleaner', 'All-purpose cleaner', 'Screwdriver', 'Lubricant (if needed)'],
    proTip: 'Clean wheels make a huge difference! Remove them and pull out hair/debris monthly for smooth rolling.',
    relatedTips: ['o1', 'l1']
  },
  {
    id: 'o6',
    title: 'Printer & Office Equipment Care',
    room: 'office',
    type: 'quick',
    difficulty: 'easy',
    time: 15,
    frequency: 'monthly',
    tags: ['maintenance', 'quick-tip'],
    icon: '🖨️',
    rating: 4.4,
    steps: [
      'Unplug equipment before cleaning',
      'Dust exterior with microfiber cloth',
      'Use compressed air for vents',
      'Clean paper feed rollers with damp cloth',
      'Wipe down paper trays inside and out',
      'Check ink/toner levels and replace if low',
      'Run printer cleaning cycle',
      'Print test page to check quality',
      'Organize supplies nearby'
    ],
    supplies: ['Microfiber cloths', 'Compressed air', 'Printer cleaning sheets (optional)'],
    proTip: 'Print at least once a week to prevent ink from drying. Clean rollers monthly to prevent paper jams.',
    relatedTips: ['o2', 'o4']
  }
];

// Seasonal Cleaning Checklists
const seasonalChecklists = {
  spring: {
    title: 'Spring Deep Clean',
    icon: '🌸',
    tasks: [
      'Wash all windows inside and out',
      'Deep clean carpets and rugs',
      'Vacuum and flip mattresses',
      'Clean behind and under furniture',
      'Organize and declutter closets',
      'Power wash exterior surfaces',
      'Clean gutters and downspouts',
      'Service HVAC system',
      'Deep clean kitchen appliances',
      'Wash curtains and bedding',
      'Clean light fixtures and ceiling fans',
      'Organize garage and shed'
    ]
  },
  summer: {
    title: 'Summer Refresh',
    icon: '☀️',
    tasks: [
      'Clean and maintain air conditioning units',
      'Organize outdoor spaces',
      'Clean grill and patio furniture',
      'Declutter and donate unused items',
      'Deep clean refrigerator and freezer',
      'Wash exterior windows',
      'Clean and organize garage',
      'Vacuum and clean outdoor rugs',
      'Service lawn equipment',
      'Clean and inspect deck/patio',
      'Organize summer sports equipment',
      'Deep clean bathroom grout'
    ]
  },
  fall: {
    title: 'Fall Preparation',
    icon: '🍂',
    tasks: [
      'Clean and store summer items',
      'Deep clean fireplace and chimney',
      'Check and replace furnace filters',
      'Clean gutters of fallen leaves',
      'Wash and store outdoor furniture',
      'Deep clean kitchen before holidays',
      'Organize pantry and check expiration dates',
      'Vacuum/clean heating vents',
      'Wash heavy blankets and comforters',
      'Clean and organize coat closet',
      'Inspect and clean dryer vents',
      'Prepare guest rooms for holiday visitors'
    ]
  },
  winter: {
    title: 'Winter Deep Clean',
    icon: '❄️',
    tasks: [
      'Deep clean and organize holiday decorations',
      'Clean baseboards and molding',
      'Organize and declutter paperwork',
      'Deep clean bathrooms',
      'Vacuum under furniture and beds',
      'Clean inside kitchen cabinets',
      'Organize closets and donate',
      'Deep clean entryway and mudroom',
      'Wash throw pillows and blankets',
      'Clean and organize basement/attic',
      'Service major appliances',
      'Plan and prep for spring cleaning'
    ]
  }
};

// Product Recommendations
const productRecommendations = [
  {
    category: 'All-Purpose',
    name: 'Microfiber Cleaning Cloths',
    pros: ['Reusable', 'No chemicals needed', 'Lint-free', 'Cost-effective'],
    cons: ['Must wash separately', 'Don\'t use fabric softener'],
    bestFor: 'Everything from glass to stainless steel',
    ecoFriendly: true,
    budgetFriendly: true
  },
  {
    category: 'Kitchen',
    name: 'White Vinegar',
    pros: ['Natural disinfectant', 'Cuts grease', 'Removes odors', 'Very affordable'],
    cons: ['Strong smell initially', 'Not for natural stone'],
    bestFor: 'Microwave, coffee maker, refrigerator, general cleaning',
    ecoFriendly: true,
    budgetFriendly: true
  },
  {
    category: 'Bathroom',
    name: 'Baking Soda',
    pros: ['Natural abrasive', 'Deodorizer', 'Safe for most surfaces', 'Multi-purpose'],
    cons: ['Requires elbow grease', 'May scratch delicate surfaces'],
    bestFor: 'Tubs, sinks, grout, deodorizing',
    ecoFriendly: true,
    budgetFriendly: true
  },
  {
    category: 'Floors',
    name: 'Steam Mop',
    pros: ['No chemicals', 'Sanitizes', 'Dries quickly', 'Eco-friendly'],
    cons: ['Initial cost', 'Not for unsealed wood', 'Needs electricity'],
    bestFor: 'Tile, laminate, sealed hardwood',
    ecoFriendly: true,
    budgetFriendly: false
  },
  {
    category: 'General',
    name: 'HEPA Vacuum',
    pros: ['Removes allergens', 'Better air quality', 'Efficient cleaning'],
    cons: ['More expensive', 'Filters need replacing'],
    bestFor: 'Allergy sufferers, pet owners',
    ecoFriendly: false,
    budgetFriendly: false
  },
  {
    category: 'Stains',
    name: 'Enzyme Cleaner',
    pros: ['Breaks down organic stains', 'Safe for pets', 'Removes odors'],
    cons: ['Takes time to work', 'May need multiple applications'],
    bestFor: 'Pet stains, blood, food stains',
    ecoFriendly: true,
    budgetFriendly: false
  }
];

// Main Component
export default function CleaningTipsPage() {
  // State Management
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // all, quick, deep
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [expandedTip, setExpandedTip] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [completedTips, setCompletedTips] = useState([]);
  const [activeSection, setActiveSection] = useState('tips');
  const [sortBy, setSortBy] = useState('rating'); // rating, time, difficulty
  const [showFilters, setShowFilters] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const savedCompleted = JSON.parse(localStorage.getItem('completedTips') || '[]');
    const savedShoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');

    setDarkMode(savedDarkMode);
    setFavorites(savedFavorites);
    setCompletedTips(savedCompleted);
    setShoppingList(savedShoppingList);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('completedTips', JSON.stringify(completedTips));
  }, [completedTips]);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Filtered and Sorted Tips
  const filteredTips = useMemo(() => {
    let filtered = cleaningTipsData;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(tip =>
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tip.supplies.some(supply => supply.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by room
    if (selectedRoom !== 'all') {
      filtered = filtered.filter(tip => tip.room === selectedRoom);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(tip => tip.type === selectedType);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(tip => tip.difficulty === selectedDifficulty);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(tip =>
        selectedTags.every(tag => tip.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'time') return a.time - b.time;
      if (sortBy === 'difficulty') {
        const diffOrder = { easy: 1, medium: 2, hard: 3 };
        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, selectedRoom, selectedType, selectedDifficulty, selectedTags, sortBy]);

  // Helper Functions
  const toggleFavorite = (tipId) => {
    setFavorites(prev =>
      prev.includes(tipId) ? prev.filter(id => id !== tipId) : [...prev, tipId]
    );
  };

  const toggleCompleted = (tipId) => {
    setCompletedTips(prev =>
      prev.includes(tipId) ? prev.filter(id => id !== tipId) : [...prev, tipId]
    );
  };

  const addToShoppingList = (supplies) => {
    setShoppingList(prev => {
      const newItems = supplies.filter(item => !prev.includes(item));
      return [...prev, ...newItems];
    });
  };

  const removeFromShoppingList = (item) => {
    setShoppingList(prev => prev.filter(i => i !== item));
  };

  const shareTip = (tip) => {
    if (navigator.share) {
      navigator.share({
        title: tip.title,
        text: `Check out this cleaning tip: ${tip.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${tip.title}\n\n${tip.steps.join('\n')}`);
      alert('Tip copied to clipboard!');
    }
  };

  const getRoomIcon = (room) => {
    const icons = {
      kitchen: <Home className="w-5 h-5" />,
      bathroom: <Bath className="w-5 h-5" />,
      bedroom: <Bed className="w-5 h-5" />,
      living: <Sofa className="w-5 h-5" />,
      laundry: <Shirt className="w-5 h-5" />,
      office: <Briefcase className="w-5 h-5" />
    };
    return icons[room] || <Home className="w-5 h-5" />;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[difficulty] || colors.easy;
  };

  const getTypeColor = (type) => {
    return type === 'quick'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  };

  const allTags = ['eco-friendly', 'budget-friendly', 'allergen-free', 'pet-friendly', 'quick-tip', 'deep-clean'];

  const completionPercentage = (completedTips.length / cleaningTipsData.length) * 100;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <Sparkles className="w-16 h-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Your Complete Cleaning Guide
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Professional tips, room-by-room guides, and expert tricks for a spotless home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span>{completedTips.length} tasks completed</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <Heart className="w-5 h-5" />
                <span>{favorites.length} favorites saved</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4 overflow-x-auto">
              {['tips', 'seasonal', 'products', 'schedule'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeSection === section
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {section === 'tips' && <Sparkles className="inline w-4 h-4 mr-2" />}
                  {section === 'seasonal' && <Calendar className="inline w-4 h-4 mr-2" />}
                  {section === 'products' && <Award className="inline w-4 h-4 mr-2" />}
                  {section === 'schedule' && <Printer className="inline w-4 h-4 mr-2" />}
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              {shoppingList.length > 0 && (
                <button
                  onClick={() => setShowSchedule(true)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Shopping list"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {shoppingList.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Tracker */}
        {completedTips.length > 0 && activeSection === 'tips' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Progress</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {completedTips.length} of {cleaningTipsData.length} tips completed
                </p>
              </div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {Math.round(completionPercentage)}%
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Tips Section */}
        {activeSection === 'tips' && (
          <>
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search cleaning tips, supplies, or techniques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors text-lg"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-500 transition-colors"
              >
                <Filter className="w-5 h-5" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-6"
                  >
                    {/* Room Filter */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Room</h4>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'kitchen', 'bathroom', 'bedroom', 'living', 'laundry', 'office'].map((room) => (
                          <button
                            key={room}
                            onClick={() => setSelectedRoom(room)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              selectedRoom === room
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {room === 'all' ? 'All Rooms' : room.charAt(0).toUpperCase() + room.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Type</h4>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'quick', 'deep'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              selectedType === type
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {type === 'all' ? 'All Types' : type === 'quick' ? 'Quick Tips' : 'Deep Clean'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Difficulty</h4>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'easy', 'medium', 'hard'].map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              selectedDifficulty === diff
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags Filter */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSelectedTags(prev =>
                                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                              selectedTags.includes(tag)
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {tag === 'eco-friendly' && <Leaf className="w-4 h-4" />}
                            {tag === 'budget-friendly' && <DollarSign className="w-4 h-4" />}
                            {tag === 'pet-friendly' && <PawPrint className="w-4 h-4" />}
                            {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h4>
                      <div className="flex flex-wrap gap-2">
                        {['rating', 'time', 'difficulty'].map((sort) => (
                          <button
                            key={sort}
                            onClick={() => setSortBy(sort)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              sortBy === sort
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {sort === 'rating' && <Star className="inline w-4 h-4 mr-1" />}
                            {sort === 'time' && <Clock className="inline w-4 h-4 mr-1" />}
                            {sort.charAt(0).toUpperCase() + sort.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tips Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                      completedTips.includes(tip.id) ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-4xl">{tip.icon}</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFavorite(tip.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              favorites.includes(tip.id)
                                ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            aria-label="Add to favorites"
                          >
                            <Heart className={`w-5 h-5 ${favorites.includes(tip.id) ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => toggleCompleted(tip.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              completedTips.includes(tip.id)
                                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            aria-label="Mark as completed"
                          >
                            <Check className={`w-5 h-5 ${completedTips.includes(tip.id) ? 'font-bold' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {tip.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(tip.type)}`}>
                          {tip.type === 'quick' ? 'Quick Tip' : 'Deep Clean'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(tip.difficulty)}`}>
                          {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{tip.time} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{tip.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getRoomIcon(tip.room)}
                          <span className="capitalize">{tip.room}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tip.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs flex items-center gap-1">
                            {tag === 'eco-friendly' && <Leaf className="w-3 h-3" />}
                            {tag === 'budget-friendly' && <DollarSign className="w-3 h-3" />}
                            {tag === 'pet-friendly' && <PawPrint className="w-3 h-3" />}
                            {tag.split('-').join(' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expandable Content */}
                    <div className="p-6">
                      <button
                        onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                        className="w-full flex items-center justify-between text-left font-semibold text-gray-900 dark:text-white mb-4 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        <span>View Steps & Details</span>
                        {expandedTip === tip.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

                      <AnimatePresence>
                        {expandedTip === tip.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            {/* Steps */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Steps
                              </h4>
                              <ol className="space-y-2">
                                {tip.steps.map((step, idx) => (
                                  <li key={idx} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                      {idx + 1}
                                    </span>
                                    <span className="flex-1">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Supplies */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <ShoppingCart className="w-4 h-4" />
                                  Supplies Needed
                                </h4>
                                <button
                                  onClick={() => addToShoppingList(tip.supplies)}
                                  className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                >
                                  Add to List
                                </button>
                              </div>
                              <ul className="space-y-1">
                                {tip.supplies.map((supply, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                                    {supply}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Pro Tip */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                              <div className="flex gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Pro Tip</h5>
                                  <p className="text-sm text-yellow-800 dark:text-yellow-300">{tip.proTip}</p>
                                </div>
                              </div>
                            </div>

                            {/* Frequency */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>Recommended frequency: <strong className="text-gray-900 dark:text-white capitalize">{tip.frequency}</strong></span>
                            </div>

                            {/* Share Button */}
                            <button
                              onClick={() => shareTip(tip)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              Share This Tip
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredTips.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No tips found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search query</p>
              </div>
            )}
          </>
        )}

        {/* Seasonal Section */}
        {activeSection === 'seasonal' && (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(seasonalChecklists).map(([season, data]) => (
              <motion.div
                key={season}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{data.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data.title}</h3>
                </div>
                <ul className="space-y-2">
                  {data.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <Download className="w-5 h-5" />
                  Download Checklist
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Products Section */}
        {activeSection === 'products' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productRecommendations.map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                    {product.category}
                  </span>
                  <div className="flex gap-2">
                    {product.ecoFriendly && (
                      <span className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full" title="Eco-friendly">
                        <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </span>
                    )}
                    {product.budgetFriendly && (
                      <span className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full" title="Budget-friendly">
                        <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{product.bestFor}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400 text-sm mb-2">Pros:</h4>
                    <ul className="space-y-1">
                      {product.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400 text-sm mb-2">Cons:</h4>
                    <ul className="space-y-1">
                      {product.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Schedule Section */}
        {activeSection === 'schedule' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              Your Cleaning Schedule
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {['daily', 'weekly', 'monthly', 'quarterly'].map((freq) => {
                const tasksForFrequency = cleaningTipsData.filter(tip => tip.frequency === freq);
                return (
                  <div key={freq} className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize pb-2 border-b-2 border-purple-600">
                      {freq}
                    </h3>
                    <ul className="space-y-2">
                      {tasksForFrequency.map((tip) => (
                        <li key={tip.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-lg">{tip.icon}</span>
                          <span>{tip.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <button className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-lg font-semibold">
              <Printer className="w-6 h-6" />
              Print Full Schedule
            </button>
          </div>
        )}
      </div>

      {/* Shopping List Modal */}
      <AnimatePresence>
        {showSchedule && shoppingList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSchedule(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-7 h-7 text-purple-600" />
                  Shopping List
                </h3>
                <button
                  onClick={() => setShowSchedule(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <ul className="space-y-2 mb-6">
                {shoppingList.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">{item}</span>
                    <button
                      onClick={() => removeFromShoppingList(item)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  const text = shoppingList.join('\n');
                  navigator.clipboard.writeText(text);
                  alert('Shopping list copied to clipboard!');
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                <Download className="w-5 h-5" />
                Copy to Clipboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">💡 Pro tip: Consistency is key! Set reminders for your cleaning tasks.</p>
            <p className="text-sm">Made with ❤️ for a cleaner, happier home</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
