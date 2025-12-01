'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Search, Filter, Moon, Sun, Heart, Share2, Check, Clock, Star,
 ChevronDown, ChevronRight, Sparkles, Home, Bath, Bed, Sofa, Shirt,
 Briefcase, Calendar, ShoppingCart, Printer, X, Leaf, DollarSign,
 PawPrint, AlertCircle, BookOpen, Download, CheckCircle, BarChart3,
 ChefHat, Droplets, Wind, Lamp, WashingMachine, Monitor, CircleDot,
 Award, ArrowRight, Shield, TrendingUp
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
  icon: 'ChefHat',
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
  icon: 'ChefHat',
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
  icon: 'Home',
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
  icon: 'Sparkles',
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
  icon: 'ChefHat',
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
  icon: 'Droplets',
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
  icon: 'Droplets',
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
  icon: 'Bath',
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
  icon: 'Sparkles',
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
  icon: 'Droplets',
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
  icon: 'Wind',
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
  icon: 'Sparkles',
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
  icon: 'Bed',
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
  icon: 'Home',
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
  icon: 'Wind',
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
  icon: 'Home',
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
  icon: 'Lamp',
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
  icon: 'Bed',
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
  icon: 'Sofa',
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
  icon: 'Monitor',
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
  icon: 'Home',
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
  icon: 'BookOpen',
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
  icon: 'Sparkles',
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
  icon: 'Home',
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
  icon: 'WashingMachine',
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
  icon: 'AlertCircle',
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
  icon: 'Shirt',
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
  icon: 'Droplets',
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
  icon: 'WashingMachine',
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
  icon: 'Sparkles',
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
  icon: 'Briefcase',
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
  icon: 'Monitor',
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
  icon: 'Briefcase',
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
  icon: 'Monitor',
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
  icon: 'Briefcase',
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
  icon: 'Monitor',
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
// Room sections configuration - Expanded to 15+ categories
const roomSections = [
 {
  id: 'general',
  title: 'All Rooms - Universal Cleaning Principles',
  description: 'Master the foundational techniques that professional cleaners use in every space. These universal principles ensure consistent results across your entire home.',
  icon: Home,
  color: 'text-pink-600',
  timeEstimate: '30-45 minutes per room',
  complexity: 'Easy to Medium',
  intro: 'Every room in your home requires attention to detail and systematic approach. Professional cleaners follow a ceiling-to-floor methodology that prevents re-cleaning and ensures nothing is missed.',
  subsections: [
   {
    title: 'Decluttering & Preparation',
    time: '10-15 minutes',
    tasks: [
     'Clear all surfaces and remove items that don\'t belong',
     'Sort items: keep, donate, discard',
     'Place items to be relocated in a basket',
     'Remove trash and recycling',
     'Clear floor of obstacles and items',
     'Open windows for ventilation',
     'Gather all cleaning supplies before starting'
    ]
   },
   {
    title: 'Ceiling to Floor Cleaning',
    time: '15-20 minutes',
    tasks: [
     'Dust ceiling corners and light fixtures',
     'Wipe ceiling fan blades (if applicable)',
     'Clean air vents and returns',
     'Dust crown molding and upper shelves',
     'Wipe down walls and light switches',
     'Clean windows and window sills',
     'Dust or wipe all furniture surfaces',
     'Clean baseboards and door frames',
     'Vacuum or sweep floors last'
    ]
   },
   {
    title: 'High-Touch Surface Disinfection',
    time: '5-10 minutes',
    tasks: [
     'Door handles and knobs',
     'Light switches and outlet covers',
     'Remote controls',
     'Phone chargers and cables',
     'Drawer and cabinet pulls',
     'Thermostats and control panels'
    ]
   }
  ],
  supplies: ['All-purpose cleaner', 'Disinfectant spray', 'Microfiber cloths', 'Duster with extension pole', 'Vacuum with attachments', 'Trash bags', 'Basket for misplaced items'],
  frequency: {
   daily: ['Declutter surfaces', 'Quick spot clean'],
   weekly: ['Full cleaning routine', 'Disinfect high-touch surfaces'],
   monthly: ['Deep clean baseboards', 'Wash walls if needed']
  }
 },
 {
  id: 'kitchen',
  title: 'Kitchen & Dining Areas',
  description: 'The kitchen is the heart of your home and requires the most intensive cleaning routine. Professional standards demand sanitization, degreasing, and organization.',
  icon: ChefHat,
  color: 'text-pink-600',
  timeEstimate: '2.5-3.5 hours for deep clean',
  complexity: 'Medium to Hard',
  intro: 'A professional kitchen clean involves far more than wiping counters. Food preparation areas require sanitization protocols, appliances need deep cleaning inside and out, and grease removal demands specialized techniques.',
  subsections: [
   {
    title: 'Countertops & Prep Areas',
    time: '20-30 minutes',
    tasks: [
     'Clear all items from countertops',
     'Wipe small appliances before moving',
     'Clean backsplash tiles and grout',
     'Sanitize cutting board storage',
     'Clean and organize knife block or magnetic strip',
     'Wipe down and sanitize all counter surfaces',
     'Clean under small appliances and canisters',
     'Organize and return only essential items'
    ]
   },
   {
    title: 'Appliances & Equipment',
    time: '60-90 minutes',
    tasks: [
     'Deep clean refrigerator interior and exterior',
     'Remove and clean refrigerator shelves and drawers',
     'Clean refrigerator coils (every 6 months)',
     'Deep clean oven interior, racks, and door',
     'Clean stovetop, burners, and drip pans',
     'Degrease range hood and filters',
     'Clean microwave inside and out',
     'Wipe down dishwasher exterior and clean filter',
     'Run dishwasher cleaning cycle',
     'Clean small appliances (toaster, coffee maker, etc.)',
     'Wipe down all appliance control panels'
    ]
   },
   {
    title: 'Cabinets & Storage',
    time: '30-45 minutes',
    tasks: [
     'Wipe cabinet fronts and handles',
     'Degrease areas around stove',
     'Clean cabinet interiors (quarterly)',
     'Organize pantry and check expiration dates',
     'Wipe down shelf liners',
     'Clean drawer interiors',
     'Organize utensil drawers'
    ]
   },
   {
    title: 'Sink & Disposal Area',
    time: '15-20 minutes',
    tasks: [
     'Scrub sink basin with appropriate cleaner',
     'Clean and polish faucet and fixtures',
     'Clean drain and disposal',
     'Sanitize sink area including backsplash',
     'Clean under-sink cabinet',
     'Replace sponges and cleaning cloths',
     'Clean soap dispenser'
    ]
   },
   {
    title: 'Floors & Final Touches',
    time: '25-35 minutes',
    tasks: [
     'Sweep entire floor including under appliances',
     'Vacuum floor if applicable',
     'Mop with appropriate floor cleaner',
     'Clean baseboards and toe kicks',
     'Wipe down trash can interior and exterior',
     'Replace trash bag',
     'Final walkthrough and touch-ups'
    ]
   }
  ],
  supplies: ['Degreaser', 'All-purpose cleaner', 'Disinfectant', 'Baking soda', 'White vinegar', 'Stainless steel cleaner', 'Oven cleaner', 'Microfiber cloths (multiple)', 'Scrub brushes', 'Sponges', 'Floor mop', 'Vacuum', 'Rubber gloves'],
  proTips: [
   'Always clean top to bottom to avoid re-cleaning surfaces',
   'Use separate cloths for food prep areas vs. floors/trash',
   'Degrease before sanitizing for best results',
   'Clean your refrigerator before grocery shopping',
   'Never mix cleaning chemicals - dangerous fumes can result'
  ],
  commonMistakes: [
   'Using the same sponge for dishes and counters (cross-contamination)',
   'Forgetting to clean under and behind appliances',
   'Not cleaning refrigerator coils (reduces efficiency)',
   'Using too much cleaning product (causes residue)',
   'Cleaning windows on sunny days (causes streaking)'
  ]
 },
 {
  id: 'bathroom',
  title: 'Bathrooms & Powder Rooms',
  description: 'Bathrooms demand rigorous sanitization protocols. Mold, mildew, soap scum, and hard water deposits require specialized cleaning techniques and consistent maintenance.',
  icon: Bath,
  color: 'text-pink-600',
  timeEstimate: '1.5-2 hours per bathroom',
  complexity: 'Medium to Hard',
  intro: 'Professional bathroom cleaning isn\'t just about appearance—it\'s about hygiene. Moisture-prone areas breed bacteria and mold, requiring proper ventilation, targeted disinfection, and preventive maintenance.',
  subsections: [
   {
    title: 'Toilet Area Deep Clean',
    time: '20-25 minutes',
    tasks: [
     'Apply toilet bowl cleaner and let sit',
     'Clean exterior of toilet tank',
     'Wipe down tank lid and flush handle',
     'Clean toilet seat top and bottom',
     'Scrub toilet bowl and under rim thoroughly',
     'Clean base of toilet and floor around it',
     'Disinfect toilet paper holder',
     'Clean nearby walls and baseboards'
    ]
   },
   {
    title: 'Shower & Tub Cleaning',
    time: '35-45 minutes',
    tasks: [
     'Remove all bottles and products',
     'Pre-treat mold and mildew spots',
     'Apply tile and grout cleaner',
     'Scrub shower walls from top to bottom',
     'Clean grout lines with brush',
     'Scrub tub basin thoroughly',
     'Clean shower door or curtain',
     'Descale showerhead',
     'Clean tub spout and fixtures',
     'Rinse everything thoroughly',
     'Squeegee or dry surfaces',
     'Clean and organize products before returning'
    ]
   },
   {
    title: 'Vanity & Sink Area',
    time: '20-25 minutes',
    tasks: [
     'Clear all items from countertop',
     'Wipe and organize cosmetics and toiletries',
     'Clean mirrors and remove spots',
     'Scrub sink basin and faucet',
     'Clean drain and overflow',
     'Wipe countertop and backsplash',
     'Clean cabinet fronts and handles',
     'Organize drawers and cabinets',
     'Clean under-sink area',
     'Sanitize toothbrush holder and soap dispenser'
    ]
   },
   {
    title: 'Ventilation & Air Quality',
    time: '15-20 minutes',
    tasks: [
     'Clean exhaust fan cover and blades',
     'Vacuum air vents',
     'Wipe down light fixtures',
     'Clean window and sill (if applicable)',
     'Check and clean air fresheners',
     'Ensure proper ventilation during cleaning'
    ]
   },
   {
    title: 'Floors & Final Sanitization',
    time: '15-20 minutes',
    tasks: [
     'Sweep or vacuum floor completely',
     'Clean baseboards and corners',
     'Mop floor with disinfectant',
     'Pay extra attention to areas around toilet',
     'Clean trash can inside and out',
     'Replace trash bag and liners',
     'Final disinfection of high-touch surfaces'
    ]
   }
  ],
  supplies: ['Toilet bowl cleaner', 'Bathroom disinfectant', 'Tile and grout cleaner', 'Mold and mildew remover', 'Glass cleaner', 'Descaling solution', 'Scrub brushes (multiple sizes)', 'Toilet brush', 'Microfiber cloths', 'Rubber gloves', 'Squeegee', 'Old toothbrush for detail work', 'Floor mop'],
  proTips: [
   'Run shower on hot for 5 minutes before cleaning to loosen grime',
   'Use exhaust fan for 30 minutes after every shower to prevent mold',
   'Keep a squeegee in shower for daily maintenance',
   'Tackle hard water stains with vinegar, not abrasives',
   'Replace shower curtain liners every 3-6 months'
  ],
  commonMistakes: [
   'Mixing bleach with other cleaners (creates toxic gas)',
   'Not ventilating while using strong cleaners',
   'Forgetting to clean behind the toilet',
   'Using abrasive cleaners on delicate surfaces',
   'Not letting disinfectants sit long enough to work (read labels!)'
  ]
 },
 {
  id: 'bedroom',
  title: 'Bedrooms & Closets',
  description: 'Bedrooms are your personal sanctuary and sleep environment. Proper cleaning reduces allergens, promotes better sleep, and maintains a peaceful atmosphere.',
  icon: Bed,
  color: 'text-pink-600',
  timeEstimate: '1.5-2 hours per bedroom',
  complexity: 'Medium',
  intro: 'We spend a third of our lives in our bedrooms, yet they\'re often neglected in cleaning routines. Professional bedroom maintenance addresses dust, allergens, organization, and creating a restful environment conducive to quality sleep.',
  subsections: [
   {
    title: 'Bedding & Mattress Care',
    time: '30-40 minutes',
    tasks: [
     'Strip all bedding including mattress protector',
     'Wash sheets, pillowcases, and duvet covers',
     'Vacuum mattress top and sides thoroughly',
     'Spot treat any mattress stains',
     'Deodorize mattress with baking soda (let sit 1 hour)',
     'Vacuum mattress again to remove baking soda',
     'Flip or rotate mattress (quarterly)',
     'Vacuum box spring and bed frame',
     'Make bed with fresh, clean linens',
     'Fluff and arrange pillows'
    ]
   },
   {
    title: 'Closet Organization & Cleaning',
    time: '45-60 minutes',
    tasks: [
     'Remove everything from closet',
     'Vacuum or sweep closet floor',
     'Wipe down shelves and hanging rods',
     'Clean closet doors and tracks',
     'Sort clothing: keep, donate, repair, discard',
     'Organize by category and season',
     'Use uniform hangers for cohesive look',
     'Fold items neatly or use organizers',
     'Store off-season items properly',
     'Add sachets or cedar for freshness',
     'Return only current season items',
     'Clean shoes before storing'
    ]
   },
   {
    title: 'Furniture & Surfaces',
    time: '20-30 minutes',
    tasks: [
     'Declutter nightstands and dressers',
     'Dust all furniture surfaces',
     'Clean drawer interiors (quarterly)',
     'Polish wood furniture if needed',
     'Organize dresser drawers',
     'Clean mirrors and picture frames',
     'Wipe down headboard and bed frame',
     'Clean lamp shades and bases',
     'Organize charging stations and cables'
    ]
   },
   {
    title: 'Ceiling, Walls & Air Quality',
    time: '15-20 minutes',
    tasks: [
     'Dust ceiling corners and light fixtures',
     'Clean ceiling fan blades (if applicable)',
     'Wipe down walls and remove marks',
     'Clean air vents and returns',
     'Dust window treatments or wash curtains',
     'Clean windows and window sills',
     'Wipe down baseboards and crown molding'
    ]
   },
   {
    title: 'Floors & Final Organization',
    time: '20-25 minutes',
    tasks: [
     'Clear floor completely',
     'Vacuum or sweep thoroughly under bed',
     'Clean baseboards and corners',
     'Vacuum or mop floors',
     'Clean inside and under furniture',
     'Organize items before returning to room',
     'Ensure clear pathways',
     'Final declutter and arrangement'
    ]
   }
  ],
  supplies: ['Vacuum with attachments', 'Baking soda', 'All-purpose cleaner', 'Wood polish', 'Microfiber cloths', 'Duster', 'Enzyme cleaner for stains', 'Storage bins and organizers', 'Matching hangers', 'Drawer dividers'],
  proTips: [
   'Wash bedding weekly in hot water to kill dust mites',
   'Use mattress and pillow protectors to extend their life',
   'Keep bedroom clutter-free for better sleep quality',
   'Maintain cooler temperatures (60-67°F) for optimal sleep',
   'Use the "one year rule" for closet purging'
  ],
  commonMistakes: [
   'Not washing pillows and comforters regularly',
   'Forgetting to vacuum under the bed',
   'Overcrowding closets (prevents air circulation)',
   'Using bedroom as storage for non-bedroom items',
   'Not rotating or flipping mattress regularly'
  ]
 },
 {
  id: 'living',
  title: 'Living Areas & Entertainment Spaces',
  description: 'Living rooms are high-traffic areas where families gather, entertain guests, and relax. These spaces require frequent maintenance and careful attention to upholstery, electronics, and surfaces.',
  icon: Sofa,
  color: 'text-pink-600',
  timeEstimate: '2-2.5 hours for complete cleaning',
  complexity: 'Medium',
  intro: 'Living areas see the most daily use and traffic, accumulating dust, pet hair, spills, and wear. Professional cleaning maintains both appearance and longevity of furniture, electronics, and flooring while creating a welcoming atmosphere.',
  subsections: [
   {
    title: 'Upholstery & Soft Furnishings',
    time: '35-45 minutes',
    tasks: [
     'Remove cushions and vacuum underneath',
     'Vacuum all upholstery surfaces thoroughly',
     'Check furniture tags for cleaning codes',
     'Spot clean stains appropriately',
     'Steam clean or shampoo if needed (quarterly)',
     'Fluff and rotate cushions',
     'Vacuum or wash throw pillows and blankets',
     'Clean under furniture if possible'
    ]
   },
   {
    title: 'Electronics & Entertainment',
    time: '20-25 minutes',
    tasks: [
     'Unplug electronics before cleaning',
     'Dust TV screen with microfiber cloth',
     'Clean TV stand and entertainment center',
     'Organize and dust cables and cords',
     'Clean gaming consoles and controllers',
     'Disinfect remote controls',
     'Dust speakers and sound equipment',
     'Clean cable boxes and streaming devices',
     'Wipe down media storage (DVD cases, etc.)'
    ]
   },
   {
    title: 'Carpets, Rugs & Hard Floors',
    time: '30-40 minutes',
    tasks: [
     'Move lightweight furniture if possible',
     'Vacuum thoroughly in multiple directions',
     'Spot treat carpet stains',
     'Deep clean carpets (seasonally)',
     'Vacuum area rugs and underneath',
     'Shake out or beat small rugs outside',
     'Sweep or vacuum hard floors',
     'Mop hard floors with appropriate cleaner',
     'Clean floor transitions and edges'
    ]
   },
   {
    title: 'Decorative Items & Shelving',
    time: '25-30 minutes',
    tasks: [
     'Dust all decorative items individually',
     'Clean picture frames and artwork',
     'Wipe down bookshelves shelf by shelf',
     'Dust books from spine to edge',
     'Organize and declutter display items',
     'Clean vases, candles, and décor',
     'Wipe down plant leaves (if applicable)',
     'Rotate seasonal decorations'
    ]
   },
   {
    title: 'Windows, Walls & Finishing',
    time: '25-30 minutes',
    tasks: [
     'Dust ceiling fans and light fixtures',
     'Clean windows inside (outside seasonally)',
     'Wipe window sills and frames',
     'Vacuum or dust window treatments',
     'Wipe walls and remove scuff marks',
     'Clean baseboards and trim',
     'Dust air vents and returns',
     'Final vacuum of entire room'
    ]
   }
  ],
  supplies: ['Vacuum with attachments', 'Upholstery cleaner', 'Carpet spot remover', 'Microfiber cloths', 'Duster', 'All-purpose cleaner', 'Glass cleaner', 'Wood polish', 'Electronics cleaning wipes', 'Compressed air'],
  proTips: [
   'Vacuum high-traffic areas twice weekly',
   'Rotate furniture periodically to even wear',
   'Use arm covers and throws to protect upholstery',
   'Keep humidity levels balanced to prevent electronics issues',
   'Professional carpet cleaning every 12-18 months recommended'
  ],
  commonMistakes: [
   'Spraying cleaner directly on electronics (always spray on cloth)',
   'Not checking upholstery codes before cleaning',
   'Forgetting to clean under couch cushions',
   'Over-wetting carpets when cleaning',
   'Neglecting ceiling fans (major dust source)'
  ]
 },
 {
  id: 'office',
  title: 'Home Office & Study Areas',
  description: 'A clean, organized workspace boosts productivity, reduces stress, and maintains professional standards. Electronics, paperwork, and ergonomics all require attention.',
  icon: Briefcase,
  color: 'text-pink-600',
  timeEstimate: '1.5-2 hours for complete organization and cleaning',
  complexity: 'Medium',
  intro: 'With remote work increasingly common, home office cleanliness directly impacts productivity and professional presentation. Beyond surface cleaning, proper organization, cable management, and equipment maintenance are essential.',
  subsections: [
   {
    title: 'Desk Surface & Organization',
    time: '25-30 minutes',
    tasks: [
     'Clear entire desk surface',
     'Sort papers: file, action, shred, recycle',
     'Wipe down desk surface thoroughly',
     'Clean and organize desk drawers',
     'Use drawer dividers for small items',
     'Organize pens, supplies in containers',
     'Return only essential daily items to desk',
     'Implement inbox/outbox system',
     'Organize charging stations'
    ]
   },
   {
    title: 'Computer & Electronics',
    time: '20-25 minutes',
    tasks: [
     'Shut down and unplug computer equipment',
     'Dust monitor with microfiber cloth',
     'Clean keyboard with compressed air and alcohol wipes',
     'Sanitize mouse and mouse pad',
     'Wipe down computer tower or laptop exterior',
     'Clean printer inside and out',
     'Organize and label cables',
     'Clean phone and charging dock',
     'Disinfect headphones and accessories'
    ]
   },
   {
    title: 'Filing & Paper Management',
    time: '35-45 minutes',
    tasks: [
     'Sort through all papers and files',
     'Shred outdated sensitive documents',
     'Create or refine filing system',
     'Use labeled folders and categories',
     'File current year documents accessibly',
     'Archive older files properly',
     'Scan important documents for digital backup',
     'Organize office supplies',
     'Recycle unnecessary paper'
    ]
   },
   {
    title: 'Seating & Ergonomics',
    time: '15-20 minutes',
    tasks: [
     'Vacuum office chair thoroughly',
     'Spot clean chair upholstery',
     'Wipe down armrests and base',
     'Clean and lubricate chair wheels',
     'Tighten any loose screws',
     'Adjust chair for proper ergonomics',
     'Clean desk lamp and adjust lighting',
     'Ensure proper monitor height'
    ]
   },
   {
    title: 'Room Cleaning & Air Quality',
    time: '20-25 minutes',
    tasks: [
     'Dust bookshelves and organize books',
     'Clean windows and window sills',
     'Vacuum or dust blinds/curtains',
     'Dust ceiling fan and light fixtures',
     'Wipe walls and baseboards',
     'Vacuum floor under desk and chair',
     'Mop or clean floor',
     'Empty trash and shredder bins',
     'Add plants for air quality (optional)'
    ]
   }
  ],
  supplies: ['All-purpose cleaner', 'Disinfectant wipes', 'Compressed air', 'Microfiber cloths', 'Vacuum', 'Paper shredder', 'Filing supplies', 'Cable organizers', 'Drawer dividers', 'Label maker'],
  proTips: [
   'Clean keyboard weekly - it harbors more bacteria than toilet seats',
   'Use the "touch it once" rule for papers to prevent piles',
   'Keep only current project materials on desk',
   'Digital filing reduces paper clutter significantly',
   'Take 5 minutes at end of each day to reset workspace'
  ],
  commonMistakes: [
   'Eating at desk regularly (attracts pests, damages equipment)',
   'Not backing up important files before cleaning',
   'Keeping too many "just in case" papers',
   'Forgetting to clean under keyboard keys',
   'Poor cable management (dust magnet and safety hazard)'
  ]
 },
 {
  id: 'laundry',
  title: 'Laundry & Utility Rooms',
  description: 'Laundry rooms require maintenance of appliances, organization of supplies, and prevention of mold and mildew in this moisture-heavy environment.',
  icon: WashingMachine,
  color: 'text-pink-600',
  timeEstimate: '1-1.5 hours for complete cleaning and organization',
  complexity: 'Medium',
  intro: 'An often-overlooked space, the laundry room\'s efficiency directly affects your entire cleaning routine. Proper appliance maintenance prevents costly repairs, while organization streamlines your workflow.',
  subsections: [
   {
    title: 'Washing Machine Maintenance',
    time: '25-30 minutes',
    tasks: [
     'Run empty hot cycle with vinegar',
     'Clean detergent and fabric softener dispensers',
     'Scrub door seal and remove debris',
     'Wipe down exterior and control panel',
     'Check and clean drain filter',
     'Leave door open after use to prevent mildew',
     'Wipe down top and sides',
     'Check hoses for leaks or damage'
    ]
   },
   {
    title: 'Dryer Care & Fire Prevention',
    time: '20-25 minutes',
    tasks: [
     'Clean lint trap thoroughly',
     'Vacuum lint trap cavity',
     'Disconnect and clean dryer vent hose',
     'Clean exterior vent opening',
     'Wipe down dryer drum interior',
     'Clean door and seal',
     'Wipe exterior and control panel',
     'Vacuum underneath and behind dryer',
     'Check vent for proper airflow'
    ]
   },
   {
    title: 'Storage & Organization',
    time: '25-35 minutes',
    tasks: [
     'Remove all items from shelves',
     'Wipe down all shelving',
     'Check expiration dates on products',
     'Organize by category (detergents, stain removers, etc.)',
     'Use clear bins for small items',
     'Label containers and baskets',
     'Create sorting system for laundry (colors, whites, delicates)',
     'Install hooks for hanging items',
     'Organize cleaning supplies',
     'Keep frequently used items accessible'
    ]
   },
   {
    title: 'Room Cleaning & Surfaces',
    time: '15-20 minutes',
    tasks: [
     'Wipe down countertops or folding surfaces',
     'Clean sink (if applicable)',
     'Wipe down cabinets and doors',
     'Clean light fixtures',
     'Wipe walls and check for moisture damage',
     'Clean baseboards',
     'Sweep and mop floor',
     'Check for mold or mildew, treat if found',
     'Empty trash and lint receptacles'
    ]
   }
  ],
  supplies: ['White vinegar', 'Baking soda', 'All-purpose cleaner', 'Dryer vent brush kit', 'Vacuum', 'Microfiber cloths', 'Old toothbrush', 'Storage bins', 'Labels', 'Mop'],
  proTips: [
   'Clean washer monthly to prevent mildew odors',
   'Clean dryer vent quarterly - it\'s a fire hazard',
   'Use less detergent than you think - more isn\'t better',
   'Always leave washer door open between loads',
   'Keep baking soda and vinegar on hand for natural cleaning'
  ],
  commonMistakes: [
   'Never cleaning washing machine (causes odors and buildup)',
   'Ignoring dryer vent cleaning (major fire risk)',
   'Overloading washer and dryer (reduces effectiveness)',
   'Using too much detergent (causes residue)',
   'Not checking pockets before washing (damages machines)'
  ]
 },
 {
  id: 'entryway',
  title: 'Entryways & Mudrooms',
  description: 'Your home\'s first impression and a barrier against outdoor dirt. Entryways require strategic organization and frequent maintenance to prevent dirt from spreading throughout your home.',
  icon: Home,
  color: 'text-pink-600',
  timeEstimate: '45-60 minutes',
  complexity: 'Easy to Medium',
  intro: 'Entryways are your home\'s first line of defense against outdoor dirt, mud, and debris. A well-organized, clean entryway prevents dirt from being tracked throughout your home and creates an inviting first impression.',
  subsections: [
   {
    title: 'Shoe & Coat Organization',
    time: '20-25 minutes',
    tasks: [
     'Remove all shoes and assess condition',
     'Clean or discard worn-out shoes',
     'Organize by frequency of use and season',
     'Use shoe rack or cubby system',
     'Clean inside of shoe storage',
     'Hang or organize coats and jackets',
     'Remove off-season items to storage',
     'Clean coat hooks and hangers',
     'Organize accessories (hats, scarves, gloves)'
    ]
   },
   {
    title: 'Surface Cleaning',
    time: '15-20 minutes',
    tasks: [
     'Declutter entry table or bench',
     'Wipe down all surfaces',
     'Clean mirrors and picture frames',
     'Organize key holder and mail station',
     'Wipe down door interior and exterior',
     'Clean door hardware and handle',
     'Wipe light switches and fixtures',
     'Clean baseboards and trim'
    ]
   },
   {
    title: 'Floor & Mat Maintenance',
    time: '15-20 minutes',
    tasks: [
     'Shake out or vacuum entry mats (both sides)',
     'Wash mats if machine-washable',
     'Sweep or vacuum floor thoroughly',
     'Mop with appropriate cleaner',
     'Clean corners and edges',
     'Wipe down floor trim',
     'Replace or clean outdoor mat'
    ]
   }
  ],
  supplies: ['All-purpose cleaner', 'Glass cleaner', 'Vacuum', 'Mop', 'Microfiber cloths', 'Shoe cleaning supplies', 'Storage organizers'],
  proTips: [
   'Place both indoor and outdoor mats to trap maximum dirt',
   'Implement "shoes off" policy to reduce indoor cleaning',
   'Clean this area twice weekly during wet/muddy seasons',
   'Keep a basket for items that need to go elsewhere in house'
  ]
 },
 {
  id: 'spring',
  title: 'Seasonal Deep Cleaning',
  description: 'Comprehensive deep cleaning protocols for spring, fall, and seasonal transitions. Address areas typically overlooked in regular cleaning routines.',
  icon: Sparkles,
  color: 'text-pink-600',
  timeEstimate: '12-18 hours total (spread over several days)',
  complexity: 'Hard',
  intro: 'Seasonal deep cleaning tackles the areas we don\'t clean regularly. This intensive process refreshes your entire home, addresses neglected areas, and prepares your space for seasonal changes. Professional cleaners allocate full days for comprehensive deep cleaning.',
  subsections: [
   {
    title: 'Windows & Treatments (All Rooms)',
    time: '3-4 hours',
    tasks: [
     'Wash all windows inside and outside',
     'Clean window frames, sills, and tracks',
     'Remove and wash screens',
     'Vacuum or wash all curtains and drapes',
     'Dust or clean all blinds',
     'Clean window hardware'
    ]
   },
   {
    title: 'Walls, Ceilings & Fixtures',
    time: '2-3 hours',
    tasks: [
     'Dust all ceiling corners',
     'Clean all light fixtures and bulbs',
     'Wash ceiling fans thoroughly',
     'Wipe down all walls and remove marks',
     'Clean baseboards in every room',
     'Dust crown molding and trim',
     'Clean air vents and returns',
     'Replace HVAC filters'
    ]
   },
   {
    title: 'Deep Carpet & Upholstery Cleaning',
    time: '3-4 hours',
    tasks: [
     'Vacuum all upholstery thoroughly',
     'Steam clean all sofas and chairs',
     'Move furniture and clean underneath',
     'Vacuum carpets in multiple directions',
     'Pre-treat stains',
     'Deep clean all carpets with machine',
     'Clean or replace area rugs',
     'Allow proper drying time'
    ]
   },
   {
    title: 'Kitchen Deep Dive',
    time: '2-3 hours',
    tasks: [
     'Empty and clean all cabinets',
     'Organize and purge pantry',
     'Deep clean all appliances inside and out',
     'Clean refrigerator coils',
     'Degrease range hood and filters',
     'Clean oven thoroughly',
     'Wipe down all cabinet interiors',
     'Organize under sink',
     'Deep clean floors including under appliances'
    ]
   }
  ],
  supplies: ['Carpet cleaner machine', 'Steam cleaner', 'Extension poles and ladders', 'Comprehensive cleaning supply kit', 'Storage and organization supplies', 'Heavy-duty gloves and protective gear'],
  proTips: [
   'Schedule seasonal cleaning over multiple days, not all at once',
   'Work room by room to avoid feeling overwhelmed',
   'Consider hiring professionals for carpets and windows',
   'Use this opportunity to declutter and donate',
   'Take before and after photos for motivation'
  ]
 },
 {
  id: 'move',
  title: 'Move-In/Move-Out Cleaning',
  description: 'Comprehensive cleaning protocols for moving situations. Ensure properties are spotless for new occupants or to secure deposit returns.',
  icon: TrendingUp,
  color: 'text-pink-600',
  timeEstimate: '8-12 hours for average home',
  complexity: 'Hard',
  intro: 'Move-in/move-out cleaning is the most thorough cleaning service. Empty homes reveal every mark, scuff, and stain. Professional standards require cleaning areas rarely addressed in occupied homes, ensuring the property is pristine for the next occupants.',
  subsections: [
   {
    title: 'Kitchen (Empty)',
    time: '2-3 hours',
    tasks: [
     'Clean inside all cabinets and drawers',
     'Wipe cabinet exteriors, tops, and baseboards',
     'Clean all appliances inside and out',
     'Clean refrigerator including coils',
     'Deep clean oven, stovetop, and hood',
     'Scrub backsplash and walls',
     'Clean countertops thoroughly',
     'Wash windows and sills',
     'Clean light fixtures',
     'Sweep and mop floors',
     'Clean baseboards and trim'
    ]
   },
   {
    title: 'Bathrooms (All)',
    time: '1.5-2 hours per bathroom',
    tasks: [
     'Scrub and sanitize toilet completely',
     'Deep clean shower/tub, grout, and tiles',
     'Descale fixtures',
     'Clean mirrors and medicine cabinet',
     'Scrub sink and vanity',
     'Clean inside cabinets and drawers',
     'Wipe cabinet exteriors',
     'Clean light fixtures',
     'Wash walls and baseboards',
     'Sweep and mop floor',
     'Clean exhaust fan'
    ]
   },
   {
    title: 'All Bedrooms & Living Areas',
    time: '1 hour per room',
    tasks: [
     'Dust ceiling fans and light fixtures',
     'Wipe down walls and remove marks',
     'Clean windows, sills, and tracks',
     'Wipe baseboards and trim',
     'Clean inside closets',
     'Vacuum or mop floors',
     'Clean doors and hardware',
     'Wipe switches and outlets'
    ]
   },
   {
    title: 'Final Touches',
    time: '1-2 hours',
    tasks: [
     'Vacuum/mop all floors again',
     'Wipe down all door frames',
     'Clean entry areas',
     'Final bathroom checks',
     'Check all surfaces for spots',
     'Remove all trash',
     'Final walkthrough with checklist'
    ]
   }
  ],
  supplies: ['Complete professional cleaning kit', 'Heavy-duty cleaners', 'Scrubbers and brushes', 'Vacuum and mop', 'Ladder', 'Trash bags', 'Protective equipment'],
  proTips: [
   'Take photos before and after for landlord documentation',
   'Work room by room, completely finishing each before moving on',
   'Start with kitchen and bathrooms (most time-intensive)',
   'Save floors for last to avoid re-cleaning',
   'Consider hiring professionals to ensure deposit return'
  ]
 },
 {
  id: 'preevent',
  title: 'Pre-Event Preparation Cleaning',
  description: 'Prepare your home for guests and special occasions with targeted cleaning that ensures every visible area is spotless.',
  icon: Star,
  color: 'text-pink-600',
  timeEstimate: '3-5 hours depending on home size',
  complexity: 'Medium',
  intro: 'Hosting guests requires cleaning with fresh eyes. Focus on guest-visible areas, high-touch surfaces, and creating an inviting atmosphere. Professional pre-event cleaning ensures your home makes the best impression.',
  subsections: [
   {
    title: 'Guest Bathroom Priority',
    time: '45-60 minutes',
    tasks: [
     'Deep clean and sanitize thoroughly',
     'Stock fresh towels and toiletries',
     'Clean mirrors until spotless',
     'Ensure toilet is pristine',
     'Fresh flowers or air freshener',
     'Empty trash completely',
     'Refill soap and paper products'
    ]
   },
   {
    title: 'Living & Entertainment Areas',
    time: '60-90 minutes',
    tasks: [
     'Declutter all surfaces completely',
     'Dust everything thoroughly',
     'Vacuum carpets and furniture',
     'Clean coffee table and surfaces',
     'Fluff pillows and arrange seating',
     'Clean windows and mirrors',
     'Fresh flowers or decorative touches'
    ]
   },
   {
    title: 'Kitchen & Dining',
    time: '60-75 minutes',
    tasks: [
     'Clear and clean countertops',
     'Clean sink until it shines',
     'Wipe down all visible appliances',
     'Clean table and chairs',
     'Sweep and mop floors',
     'Empty trash and recycling',
     'Stock hand towels'
    ]
   },
   {
    title: 'Entryway First Impressions',
    time: '20-30 minutes',
    tasks: [
     'Organize coat closet',
     'Clean entry floors',
     'Declutter surfaces',
     'Clean mirrors',
     'Add welcoming touches',
     'Ensure good lighting'
    ]
   }
  ],
  proTips: [
   'Clean from guest perspective - what will they see?',
   'Focus on bathrooms, kitchen, and living areas',
   'Add fresh flowers and pleasant scents',
   'Declutter first, then deep clean',
   'Do final walkthrough as if you\'re a guest arriving'
  ]
 },
 {
  id: 'postrenovation',
  title: 'Post-Renovation Cleanup',
  description: 'Specialized cleaning for post-construction and renovation situations. Remove dust, debris, and residue that standard cleaning cannot address.',
  icon: AlertCircle,
  color: 'text-pink-600',
  timeEstimate: '10-20 hours depending on renovation scope',
  complexity: 'Very Hard',
  intro: 'Post-renovation cleaning is the most challenging cleaning scenario. Construction dust penetrates everywhere, requiring multiple cleaning passes and specialized techniques. Professional post-renovation cleaning often requires industrial equipment and specific safety protocols.',
  subsections: [
   {
    title: 'Initial Debris Removal',
    time: '2-3 hours',
    tasks: [
     'Remove all large debris and materials',
     'Sweep entire area thoroughly',
     'Vacuum with HEPA filter',
     'Dispose of construction trash properly',
     'Check for and remove stickers and labels',
     'Remove protective coverings carefully'
    ]
   },
   {
    title: 'Dust Removal (Multiple Passes)',
    time: '4-6 hours',
    tasks: [
     'Dust ceilings and walls top to bottom',
     'Wipe down all surfaces multiple times',
     'Clean inside all cabinets and drawers',
     'Vacuum and wipe air vents',
     'Clean window sills and tracks',
     'Wipe baseboards and trim',
     'Change HVAC filters immediately',
     'Run air purifiers if available'
    ]
   },
   {
    title: 'Detail Cleaning',
    time: '3-5 hours',
    tasks: [
     'Clean all windows inside and out',
     'Remove paint splatters and residue',
     'Clean light fixtures and fans',
     'Wipe down all switches and outlets',
     'Clean inside and outside of new appliances',
     'Remove stickers and protective film',
     'Polish fixtures and hardware',
     'Clean grout and tile thoroughly'
    ]
   },
   {
    title: 'Floor Restoration',
    time: '2-4 hours',
    tasks: [
     'Vacuum all floors multiple times',
     'Sweep thoroughly',
     'Mop hard floors several times',
     'Clean grout lines',
     'Polish or seal floors if needed',
     'Clean baseboards again after floors',
     'Professional carpet cleaning if applicable'
    ]
   }
  ],
  supplies: ['HEPA vacuum', 'Multiple microfiber cloths', 'Heavy-duty cleaners', 'Scrapers for residue', 'Protective equipment', 'Trash bags', 'Air purifier (recommended)'],
  proTips: [
   'Expect to clean everything at least twice',
   'Change vacuum bags/filters frequently',
   'Wear protective mask - construction dust is harmful',
   'Work top to bottom, finish with floors',
   'Consider hiring professional post-construction cleaners'
  ],
  commonMistakes: [
   'Not wearing protective equipment (serious health risk)',
   'Cleaning floors first (dust settles on them)',
   'Using regular vacuum instead of HEPA filter',
   'Expecting one cleaning pass to be sufficient',
   'Not changing HVAC filters after construction'
  ]
 },
 {
  id: 'green',
  title: 'Green & Eco-Friendly Cleaning Methods',
  description: 'Environmentally responsible cleaning using natural products, sustainable practices, and non-toxic methods that are safe for families, pets, and the planet.',
  icon: Leaf,
  color: 'text-pink-600',
  timeEstimate: 'Same as standard methods',
  complexity: 'Easy to Medium',
  intro: 'Green cleaning doesn\'t mean compromising on cleanliness. Professional eco-friendly cleaning uses powerful natural ingredients like vinegar, baking soda, and essential oils to achieve spotless results without harsh chemicals or environmental impact.',
  subsections: [
   {
    title: 'Natural Cleaning Essentials',
    time: '10 minutes (preparation)',
    tasks: [
     'Stock white vinegar (all-purpose cleaning)',
     'Keep baking soda on hand (abrasive and deodorizer)',
     'Use castile soap (versatile cleaner)',
     'Essential oils for scent and antimicrobial properties',
     'Lemon for natural bleaching',
     'Hydrogen peroxide for disinfection',
     'Reusable microfiber cloths instead of paper towels',
     'Make DIY cleaning solutions in reusable bottles'
    ]
   },
   {
    title: 'Room-by-Room Green Solutions',
    time: 'Varies by room',
    tasks: [
     'Kitchen: Vinegar for grease, baking soda for scrubbing',
     'Bathroom: Vinegar and baking soda for toilets and tubs',
     'Glass: Vinegar and water solution',
     'Floors: Castile soap or vinegar diluted in water',
     'Air freshening: Essential oil diffusers, not aerosols',
     'Disinfecting: Hydrogen peroxide or vinegar',
     'Laundry: Eco-friendly detergents, vinegar as softener'
    ]
   },
   {
    title: 'Sustainable Practices',
    time: 'Ongoing habit changes',
    tasks: [
     'Use microfiber cloths instead of paper products',
     'Choose concentrated cleaners to reduce packaging',
     'Refill cleaning bottles instead of replacing',
     'Use cold water when possible to save energy',
     'Air dry instead of using dryer when feasible',
     'Choose products with minimal packaging',
     'Support eco-certified cleaning brands',
     'Compost organic waste',
     'Recycle cleaning product containers'
    ]
   }
  ],
  supplies: ['White vinegar', 'Baking soda', 'Castile soap', 'Essential oils', 'Hydrogen peroxide', 'Lemons', 'Microfiber cloths', 'Reusable spray bottles', 'Eco-friendly sponges'],
  proTips: [
   'Vinegar cleans almost everything but avoid on natural stone',
   'Baking soda paste tackles tough stains naturally',
   'Essential oils add fragrance and antimicrobial benefits',
   'Microfiber cloths clean effectively with just water',
   'Open windows for natural air freshening'
  ],
  commonMistakes: [
   'Mixing vinegar and hydrogen peroxide (creates acid)',
   'Using vinegar on marble or granite (etches surface)',
   'Expecting instant results (natural cleaners may need more time)',
   'Not researching DIY recipe safety before mixing',
   'Assuming "natural" always means "safe" (some natural substances are toxic)'
  ]
 },
 {
  id: 'allergy',
  title: 'Allergy-Friendly Cleaning Protocols',
  description: 'Specialized cleaning techniques to reduce allergens, dust mites, pet dander, and indoor pollutants for healthier indoor air quality.',
  icon: Wind,
  color: 'text-pink-600',
  timeEstimate: '2x standard cleaning time initially',
  complexity: 'Medium to Hard',
  intro: 'For allergy sufferers, cleaning isn\'t just about appearance—it\'s about health. Professional allergy-friendly cleaning focuses on removing triggers, using HEPA filtration, and implementing preventive measures that standard cleaning overlooks.',
  subsections: [
   {
    title: 'HEPA Filtration & Air Quality',
    time: '30-45 minutes',
    tasks: [
     'Use only HEPA-filter vacuums',
     'Change HVAC filters monthly (MERV 11-13 rated)',
     'Run air purifiers with HEPA filters',
     'Vacuum slowly and methodically for best dust capture',
     'Vacuum carpets twice in different directions',
     'Clean or replace vacuum filters regularly',
     'Ensure proper ventilation while cleaning'
    ]
   },
   {
    title: 'Dust Mite Prevention',
    time: '45-60 minutes',
    tasks: [
     'Use allergen-proof mattress and pillow covers',
     'Wash bedding weekly in hot water (130°F+)',
     'Vacuum mattresses and upholstery thoroughly',
     'Remove or wash stuffed animals regularly',
     'Reduce bedroom humidity below 50%',
     'Minimize fabric items in bedroom',
     'Freeze items that can\'t be washed to kill mites'
    ]
   },
   {
    title: 'Pet Dander Management',
    time: '60-90 minutes',
    tasks: [
     'Vacuum all surfaces including walls (dander clings)',
     'Wash pet bedding weekly in hot water',
     'Groom pets outdoors regularly',
     'Use damp cloths to wipe surfaces (traps dander)',
     'Install HEPA air filters',
     'Keep pets out of bedrooms',
     'Vacuum furniture and drapes frequently',
     'Mop hard floors to capture settled dander'
    ]
   },
   {
    title: 'Chemical Sensitivity Considerations',
    time: 'Ongoing practice',
    tasks: [
     'Use fragrance-free cleaning products',
     'Choose hypoallergenic cleaners',
     'Avoid aerosol sprays',
     'Ensure proper ventilation',
     'Wear mask while cleaning if sensitive',
     'Allow cleaned areas to air out before use',
     'Read all product ingredients carefully'
    ]
   }
  ],
  supplies: ['HEPA vacuum', 'Allergen-proof bedding covers', 'Hypoallergenic cleaners', 'Air purifier with HEPA filter', 'High-quality HVAC filters', 'Microfiber cloths (trap vs. spread allergens)', 'Dehumidifier', 'Fragrance-free products'],
  proTips: [
   'Cleaning frequency is crucial - twice weekly minimum for high-allergen homes',
   'Damp cleaning methods prevent dust from becoming airborne',
   'Decluttering reduces surfaces where allergens collect',
   'Hard flooring is better than carpet for allergy sufferers',
   'Clean from top to bottom so settling dust is captured'
  ],
  commonMistakes: [
   'Using regular vacuum (redistributes allergens into air)',
   'Not washing bedding frequently or hot enough',
   'Cleaning with harsh chemicals (triggers respiratory issues)',
   'Forgetting walls, curtains, and vertical surfaces (dander clings)',
   'Not addressing humidity (dust mites thrive in moisture)'
  ]
 },
 {
  id: 'pets',
  title: 'Pet Owner\'s Cleaning Guide',
  description: 'Comprehensive cleaning strategies for homes with pets. Address hair, odors, stains, and hygiene challenges while maintaining a fresh, welcoming environment.',
  icon: PawPrint,
  color: 'text-pink-600',
  timeEstimate: '2-3 hours additional cleaning per week',
  complexity: 'Medium to Hard',
  intro: 'Pets bring joy but also significant cleaning challenges. Professional pet-friendly cleaning requires specialized products, techniques for hair removal, odor elimination, and stain treatment while keeping your furry family members safe.',
  subsections: [
   {
    title: 'Pet Hair Removal Strategies',
    time: '45-60 minutes',
    tasks: [
     'Vacuum all floors daily with pet-specific vacuum',
     'Use rubber gloves or squeegee on upholstery',
     'Lint roller for quick touch-ups',
     'Vacuum furniture and pet beds thoroughly',
     'Use dryer sheets to loosen hair from fabrics',
     'Damp mop hard floors to capture remaining hair',
     'Clean vacuum frequently (hair clogs quickly)',
     'Brush pets outdoors regularly to reduce shedding'
    ]
   },
   {
    title: 'Odor Control & Elimination',
    time: '30-45 minutes',
    tasks: [
     'Use enzyme cleaners on accidents (breaks down odor)',
     'Wash pet bedding weekly',
     'Sprinkle baking soda on carpets before vacuuming',
     'Clean litter boxes daily (cats)',
     'Air out home regularly',
     'Use activated charcoal for odor absorption',
     'Wash hard floors with pet-safe enzymatic cleaner',
     'Clean air vents and replace filters frequently',
     'Avoid masking odors with fragrance - eliminate source'
    ]
   },
   {
    title: 'Stain & Accident Treatment',
    time: '15-30 minutes per incident',
    tasks: [
     'Blot (never rub) fresh accidents immediately',
     'Use enzyme cleaner specifically for pet stains',
     'Let enzyme cleaner sit 10-15 minutes',
     'Blot with clean cloth, repeat if needed',
     'Rinse area with water',
     'Dry thoroughly to prevent mold',
     'Use blacklight to find old stains',
     'Consider professional carpet cleaning quarterly',
     'Test cleaners on inconspicuous areas first'
    ]
   },
   {
    title: 'Pet-Safe Cleaning Practices',
    time: 'Ongoing awareness',
    tasks: [
     'Use only pet-safe cleaning products',
     'Avoid products with ammonia (smells like urine to pets)',
     'Keep pets away from freshly cleaned areas until dry',
     'Never mix cleaning chemicals',
     'Store cleaning products securely',
     'Rinse surfaces that pets lick (bowls, floors)',
     'Avoid essential oils toxic to pets (tea tree, etc.)',
     'Ventilate well when cleaning'
    ]
   },
   {
    title: 'Preventive Measures',
    time: 'Setup and maintenance',
    tasks: [
     'Place washable rugs in high-traffic areas',
     'Use furniture covers on couches and chairs',
     'Designate pet-free zones (bedrooms)',
     'Groom pets regularly to reduce shedding',
     'Trim pet nails to prevent scratches',
     'Use litter mats to catch scattered litter',
     'Keep pet cleaning supplies readily accessible',
     'Train pets for outdoor bathroom use if possible'
    ]
   }
  ],
  supplies: ['Pet-specific vacuum (strong suction, no-tangle brushes)', 'Enzyme cleaner', 'Rubber gloves for hair removal', 'Lint rollers', 'Baking soda', 'Pet-safe cleaners', 'Blacklight for stain detection', 'Washable furniture covers', 'Air purifier'],
  proTips: [
   'Enzyme cleaners are essential - regular cleaners don\'t break down pet proteins',
   'Rubber gloves are more effective than lint rollers on furniture',
   'Clean accidents immediately - set stains are nearly impossible to remove',
   'Vacuum at least 3x per week with pets (daily for heavy shedders)',
   'Professional deep cleaning every 3-6 months is worth the investment'
  ],
  commonMistakes: [
   'Using steam cleaners on pet stains (heat sets the stain permanently)',
   'Using ammonia-based cleaners (smells like urine, attracts pets)',
   'Not using enough enzyme cleaner or not letting it sit long enough',
   'Rubbing stains instead of blotting (spreads and sets stain)',
   'Using toxic essential oils around pets',
   'Not addressing underlying cause of accidents (medical or behavioral)'
  ]
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
// Icon mapping
const iconComponents = {
 ChefHat,
 Droplets,
 Bath,
 Sparkles,
 Wind,
 Bed,
 Home,
 Lamp,
 Sofa,
 Monitor,
 BookOpen,
 WashingMachine,
 AlertCircle,
 Shirt,
 Briefcase
};
// Main Component
export default function CleaningTipsPage() {
 // State Management
 const [darkMode, setDarkMode] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [expandedSection, setExpandedSection] = useState(null);
 const [expandedTip, setExpandedTip] = useState(null);
 const [favorites, setFavorites] = useState([]);
 const [completedTips, setCompletedTips] = useState([]);
 const [activeSection, setActiveSection] = useState('tips');
 const [shoppingList, setShoppingList] = useState([]);
 const [showShoppingList, setShowShoppingList] = useState(false);
 // Load from localStorage
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
 // Save to localStorage
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
 // Organize tips by room
 const tipsByRoom = useMemo(() => {
  const organized = {
   kitchen: [],
   bathroom: [],
   bedroom: [],
   living: [],
   laundry: [],
   office: []
  };
  cleaningTipsData.forEach(tip => {
   if (organized[tip.room]) {
    organized[tip.room].push(tip);
   }
  });
  return organized;
 }, []);
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
   kitchen: <ChefHat className="w-4 h-4" />,
   bathroom: <Bath className="w-4 h-4" />,
   bedroom: <Bed className="w-4 h-4" />,
   living: <Sofa className="w-4 h-4" />,
   laundry: <WashingMachine className="w-4 h-4" />,
   office: <Briefcase className="w-4 h-4" />
  };
  return icons[room] || <Home className="w-4 h-4" />;
 };
 const getDifficultyColor = (difficulty) => {
  const colors = {
   easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
   medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
   hard: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
  };
  return colors[difficulty] || colors.easy;
 };
 const getTypeColor = (type) => {
  return type === 'quick'
  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
  : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800';
 };
 const completionPercentage = (completedTips.length / cleaningTipsData.length) * 100;
 const getIconComponent = (iconName) => {
  const Icon = iconComponents[iconName] || CircleDot;
  return <Icon className="w-5 h-5" />;
 };
 const toggleSection = (sectionId) => {
  setExpandedSection(expandedSection === sectionId ? null : sectionId);
 };
 return (
  <div className={`min-h-screen ${darkMode ? 'dark bg-gray-950' : 'bg-white'} transition-colors duration-200`}>
  {/* Hero Section */}
  <div className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
  <div className="absolute inset-0 bg-gradient-to-br from-[#1C294E]/5 via-white to-[#079447]/5 dark:from-gray-950 dark:via-gray-950 dark:to-[#1C294E]/10"></div>
  <div className="absolute inset-0 overflow-hidden">
  <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1C294E]/10 dark:bg-[#1C294E]/5 rounded-full blur-3xl"></div>
  <div className="absolute top-60 -left-40 w-80 h-80 bg-[#079447]/10 dark:bg-[#079447]/5 rounded-full blur-3xl"></div>
  </div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="max-w-3xl"
  >
  <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
  Professional Cleaning Solutions
  </h1>
  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
  Expert-curated cleaning guides and maintenance schedules for every room in your home. Trusted by professionals, designed for results.
  </p>
  {completedTips.length > 0 && (
   <div className="flex items-center gap-6 text-sm">
   <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
   <div className="w-2 h-2 bg-[#079447] rounded-full"></div>
   <span>{completedTips.length} tasks completed</span>
   </div>
   <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
   <div className="w-2 h-2 bg-[#1C294E] rounded-full"></div>
   <span>{favorites.length} saved</span>
   </div>
   </div>
  )}
  </motion.div>
  </div>
  </div>
  {/* Navigation */}
  <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex items-center justify-between py-4">
  <nav className="flex items-center gap-1">
  {[
   { id: 'tips', label: 'Cleaning Tips', icon: Sparkles },
   { id: 'products', label: 'Products', icon: Award },
   { id: 'schedule', label: 'Schedule', icon: BarChart3 }
  ].map((section) => (
   <button
   key={section.id}
   onClick={() => setActiveSection(section.id)}
   className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
    activeSection === section.id
    ? 'bg-[#1C294E] text-white dark:bg-[#1C294E] dark:text-white'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
   }`}
   >
   <section.icon className="w-4 h-4" />
   {section.label}
   </button>
  ))}
  </nav>
  <div className="flex items-center gap-2">
  {shoppingList.length > 0 && (
   <button
   onClick={() => setShowShoppingList(true)}
   className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
   >
   <ShoppingCart className="w-5 h-5" />
   <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#079447] text-white text-xs rounded-full flex items-center justify-center font-medium">
   {shoppingList.length}
   </span>
   </button>
  )}
  <button
  onClick={() => setDarkMode(!darkMode)}
  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
  >
  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
  </div>
  </div>
  </div>
  </div>
  {/* Main Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  {/* Tips Section */}
  {activeSection === 'tips' && (
   <div className="space-y-8">
   {/* Impress Cleaning Featured Box */}
   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   className="bg-[#1C294E] dark:bg-[#1C294E] rounded-2xl p-8 md:p-10 text-white shadow-xl"
   >
   <div className="flex items-start gap-4 mb-6">
   <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
   <Shield className="w-8 h-8 text-[#079447]" />
   </div>
   <div className="flex-1">
   <h2 className="text-3xl font-bold mb-3">
   Impress Cleaning Services: Professional-Grade Cleaning Expertise
   </h2>
   <p className="text-white/90 text-lg leading-relaxed mb-6">
   Our professional cleaning experts have refined these techniques over years of experience. Whether you choose to tackle these tasks yourself or let us handle them for you, understanding the scope of proper home cleaning is essential.
   </p>
   <div className="grid md:grid-cols-2 gap-4">
   <div className="flex items-start gap-3">
   <CheckCircle className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
   <p className="text-white/95">Start with decluttering—clear surfaces clean faster and more thoroughly</p>
   </div>
   <div className="flex items-start gap-3">
   <CheckCircle className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
   <p className="text-white/95">Work from ceiling to floor to avoid re-cleaning already cleaned areas</p>
   </div>
   <div className="flex items-start gap-3">
   <CheckCircle className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
   <p className="text-white/95">Disinfect high-touch surfaces daily to maintain a healthy environment</p>
   </div>
   <div className="flex items-start gap-3">
   <CheckCircle className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
   <p className="text-white/95">Match your cleaning products to your surfaces for optimal results</p>
   </div>
   <div className="flex items-start gap-3">
   <CheckCircle className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
   <p className="text-white/95">Consistency beats intensity—regular maintenance prevents deep-seated problems</p>
   </div>
   <div className="flex items-start gap-3">
   <CheckCircle className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
   <p className="text-white/95">Professional standards require attention to details most overlook</p>
   </div>
   </div>
   </div>
   </div>
   </motion.div>
   {/* Introductory Content Sections */}
   <div className="grid md:grid-cols-3 gap-6">
   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ delay: 0.1 }}
   className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8"
   >
   <div className="w-12 h-12 rounded-xl bg-[#079447]/10 dark:bg-[#079447]/20 flex items-center justify-center mb-5">
   <Award className="w-6 h-6 text-[#079447] dark:text-[#079447]" />
   </div>
   <h3 className="text-xl font-bold text-[#1C294E] dark:text-white mb-4">
   Why Professional Cleaning Expertise Matters
   </h3>
   <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
   Professional cleaning goes far beyond surface-level tidying. Our experts understand that proper cleaning requires knowledge of surface materials, chemical compatibility, proper technique sequences, and time management that most homeowners simply don't have the experience to implement effectively.
   </p>
   <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
   The difference between amateur and professional cleaning isn't just thoroughness—it's understanding which products work on which surfaces, how long disinfectants need to sit to be effective, and the correct order of operations that prevents re-contamination. These checklists reveal the true scope of comprehensive home cleaning.
   </p>
   </motion.div>
   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ delay: 0.2 }}
   className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8"
   >
   <div className="w-12 h-12 rounded-xl bg-[#1C294E]/10 dark:bg-[#1C294E]/20 flex items-center justify-center mb-5">
   <Shield className="w-6 h-6 text-[#1C294E] dark:text-[#1C294E]" />
   </div>
   <h3 className="text-xl font-bold text-[#1C294E] dark:text-white mb-4">
   The Impress Approach to Home Cleaning
   </h3>
   <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
   At Impress Cleaning Services, we follow a systematic methodology developed over thousands of cleaning sessions. We work from the ceiling down, ensuring dust and debris fall onto uncleaned surfaces rather than settled onto already-clean areas. We use color-coded microfiber systems to prevent cross-contamination between bathrooms and kitchens.
   </p>
   <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
   Our professionals know that a proper whole-home deep clean takes 12-18 hours for an average home—far more than most people realize. When you see the comprehensive checklists below, you'll understand why professional cleaning services aren't a luxury, but a practical solution for maintaining truly clean, healthy homes.
   </p>
   </motion.div>
   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ delay: 0.3 }}
   className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8"
   >
   <div className="w-12 h-12 rounded-xl bg-[#079447]/10 dark:bg-[#079447]/20 flex items-center justify-center mb-5">
   <Sparkles className="w-6 h-6 text-[#079447] dark:text-[#079447]" />
   </div>
   <h3 className="text-xl font-bold text-[#1C294E] dark:text-white mb-4">
   Essential Principles for a Truly Clean Home
   </h3>
   <div className="space-y-4">
   <div>
   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Consistency Over Intensity</h4>
   <p className="text-sm text-gray-700 dark:text-gray-300">Regular professional maintenance prevents the deep-seated grime that requires aggressive chemicals and techniques.</p>
   </div>
   <div>
   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Proper Product Selection</h4>
   <p className="text-sm text-gray-700 dark:text-gray-300">Using the wrong cleaner can permanently damage surfaces. Professionals know which products work safely on granite versus quartz, wood versus laminate.</p>
   </div>
   <div>
   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Time Investment</h4>
   <p className="text-sm text-gray-700 dark:text-gray-300">Quality cleaning cannot be rushed. Disinfectants need contact time, degreasers need to penetrate, and proper technique takes time to execute correctly.</p>
   </div>
   </div>
   </motion.div>
   </div>
   {/* Total Time Reality Check */}
   <motion.div
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ delay: 0.4 }}
   className="bg-[#1C294E] dark:bg-[#1C294E] rounded-2xl p-8 text-center border border-[#1C294E]"
   >
   <Clock className="w-12 h-12 text-[#079447] mx-auto mb-4" />
   <h3 className="text-2xl font-bold text-white mb-3">
   The Reality of Comprehensive Home Cleaning
   </h3>
   <p className="text-white/90 text-lg max-w-3xl mx-auto mb-6">
   A complete whole-home deep clean following professional standards requires <span className="text-[#079447] font-bold">12-18 hours of focused work</span> for an average-sized home. Most homeowners underestimate this by 60-70%. The checklists below show exactly why professional cleaning services save you time, energy, and ensure superior results.
   </p>
   <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
   <div className="bg-white/10 backdrop-blur rounded-xl p-4">
   <div className="text-3xl font-bold text-[#079447] mb-1">2.5-3.5h</div>
   <div className="text-sm text-white/80">Kitchen Deep Clean</div>
   </div>
   <div className="bg-white/10 backdrop-blur rounded-xl p-4">
   <div className="text-3xl font-bold text-[#079447] mb-1">1.5-2h</div>
   <div className="text-sm text-white/80">Per Bathroom</div>
   </div>
   <div className="bg-white/10 backdrop-blur rounded-xl p-4">
   <div className="text-3xl font-bold text-[#079447] mb-1">1.5-2h</div>
   <div className="text-sm text-white/80">Per Bedroom</div>
   </div>
   <div className="bg-white/10 backdrop-blur rounded-xl p-4">
   <div className="text-3xl font-bold text-[#079447] mb-1">2-2.5h</div>
   <div className="text-sm text-white/80">Living Areas</div>
   </div>
   </div>
   </motion.div>
   {/* Room Sections */}
   {roomSections.map((section, index) => {
    const roomTips = tipsByRoom[section.id] || [];
    const isExpanded = expandedSection === section.id;
    const SectionIcon = section.icon;
    return (
     <React.Fragment key={section.id}>
     <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ delay: index * 0.1 }}
     className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
     >
     {/* Section Header */}
     <button
     onClick={() => toggleSection(section.id)}
     className="w-full p-8 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
     >
     <div className="flex items-start gap-4 text-left flex-1">
     <div className="w-12 h-12 rounded-xl bg-[#079447]/10 dark:bg-[#079447]/20 flex items-center justify-center flex-shrink-0">
     <SectionIcon className="w-6 h-6 text-[#079447] dark:text-[#079447]" />
     </div>
     <div className="flex-1">
     <h2 className="text-2xl font-bold text-[#1C294E] dark:text-white mb-2">
     {section.title}
     </h2>
     <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
     {section.description}
     </p>
     {section.timeEstimate && (
      <div className="flex flex-wrap gap-3 mb-4">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#079447]/10 dark:bg-[#079447]/20 text-[#079447] dark:text-[#079447] rounded-lg text-sm font-medium">
      <Clock className="w-4 h-4" />
      {section.timeEstimate}
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C294E]/10 dark:bg-[#1C294E]/20 text-[#1C294E] dark:text-gray-300 rounded-lg text-sm font-medium border border-[#1C294E]/20 dark:border-[#1C294E]/30">
      <BarChart3 className="w-4 h-4" />
      {section.complexity}
      </span>
      </div>
     )}
     <div className="flex items-center gap-2 text-[#079447] dark:text-[#079447] font-medium">
     <span>{isExpanded ? 'Hide Details' : 'View Detailed Checklist'}</span>
     {isExpanded ? (
      <ChevronDown className="w-5 h-5" />
     ) : (
      <ArrowRight className="w-5 h-5" />
     )}
     </div>
     </div>
     </div>
     </button>
     {/* Expanded Content */}
     <AnimatePresence>
     {isExpanded && (
      <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-gray-200 dark:border-gray-800"
      >
      <div className="p-8 space-y-8">
      {/* Intro Text */}
      {section.intro && (
       <div className="bg-[#079447]/5 dark:bg-[#079447]/10 border border-[#079447]/20 dark:border-[#079447]/30 rounded-xl p-6">
       <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
       {section.intro}
       </p>
       </div>
      )}
      {/* Subsections with Detailed Checklists */}
      {section.subsections && section.subsections.length > 0 && (
       <div className="space-y-6">
       <h3 className="text-xl font-bold text-[#1C294E] dark:text-white flex items-center gap-2">
       <CheckCircle className="w-6 h-6 text-[#079447] dark:text-[#079447]" />
       Detailed Cleaning Checklist
       </h3>
       {section.subsections.map((subsection, subIdx) => (
        <div key={subIdx} className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
        {subsection.title}
        </h4>
        {subsection.time && (
         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg text-sm border border-gray-300 dark:border-gray-600">
         <Clock className="w-4 h-4" />
         {subsection.time}
         </span>
        )}
        </div>
        <ul className="space-y-2.5">
        {subsection.tasks.map((task, taskIdx) => (
         <li key={taskIdx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
         <div className="w-5 h-5 rounded border-2 border-[#079447] dark:border-[#079447] flex-shrink-0 mt-0.5"></div>
         <span className="leading-relaxed">{task}</span>
         </li>
        ))}
        </ul>
        </div>
       ))}
       </div>
      )}
      {/* Supplies Needed */}
      {section.supplies && section.supplies.length > 0 && (
       <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
       <h4 className="text-lg font-bold text-[#1C294E] dark:text-white mb-4 flex items-center gap-2">
       <ShoppingCart className="w-5 h-5 text-[#079447] dark:text-[#079447]" />
       Supplies & Equipment Needed
       </h4>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
       {section.supplies.map((supply, supIdx) => (
        <div key={supIdx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <CircleDot className="w-3 h-3 text-[#079447] dark:text-[#079447] fill-current" />
        {supply}
        </div>
       ))}
       </div>
       </div>
      )}
      {/* Pro Tips */}
      {section.proTips && section.proTips.length > 0 && (
       <div className="bg-[#079447]/5 dark:bg-[#079447]/10 border border-[#079447]/20 dark:border-[#079447]/30 rounded-xl p-6">
       <h4 className="text-lg font-bold text-[#1C294E] dark:text-white mb-4 flex items-center gap-2">
       <Sparkles className="w-5 h-5 text-[#079447] dark:text-[#079447]" />
       Professional Tips from Impress Cleaning
       </h4>
       <ul className="space-y-3">
       {section.proTips.map((tip, tipIdx) => (
        <li key={tipIdx} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
        <Star className="w-4 h-4 text-[#079447] dark:text-[#079447] fill-current flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">{tip}</span>
        </li>
       ))}
       </ul>
       </div>
      )}
      {/* Common Mistakes */}
      {section.commonMistakes && section.commonMistakes.length > 0 && (
       <div className="bg-[#1C294E]/5 dark:bg-[#1C294E]/10 border border-[#1C294E]/20 dark:border-[#1C294E]/30 rounded-xl p-6">
       <h4 className="text-lg font-bold text-[#1C294E] dark:text-white mb-4 flex items-center gap-2">
       <AlertCircle className="w-5 h-5 text-[#1C294E] dark:text-gray-400" />
       Common Mistakes to Avoid
       </h4>
       <ul className="space-y-3">
       {section.commonMistakes.map((mistake, mIdx) => (
        <li key={mIdx} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
        <X className="w-4 h-4 text-[#1C294E] dark:text-gray-400 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">{mistake}</span>
        </li>
       ))}
       </ul>
       </div>
      )}
      {/* Legacy Tip Cards (if they exist) */}
      {roomTips.length > 0 && (
       <div>
       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Reference Tips</h3>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
       {roomTips.map((tip) => (
        <div
        key={tip.id}
        className={`bg-gray-50 dark:bg-gray-800 rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden ${
         completedTips.includes(tip.id)
         ? 'border-emerald-300 dark:border-emerald-800 shadow-md shadow-emerald-100 dark:shadow-emerald-950'
         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        >
        {/* Tip Card Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        {getIconComponent(tip.icon)}
        </div>
        <div className="flex gap-1.5">
        <button
        onClick={() => toggleFavorite(tip.id)}
        className={`p-1.5 rounded-lg transition-all ${
         favorites.includes(tip.id)
         ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
         : 'text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        >
        <Heart className={`w-4 h-4 ${favorites.includes(tip.id) ? 'fill-current' : ''}`} />
        </button>
        <button
        onClick={() => toggleCompleted(tip.id)}
        className={`p-1.5 rounded-lg transition-all ${
         completedTips.includes(tip.id)
         ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
         : 'text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        >
        <Check className="w-4 h-4" />
        </button>
        </div>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
        {tip.title}
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getTypeColor(tip.type)}`}>
        {tip.type === 'quick' ? 'Quick' : 'Deep Clean'}
        </span>
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getDifficultyColor(tip.difficulty)}`}>
        {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
        </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        <span>{tip.time}m</span>
        </div>
        <div className="flex items-center gap-1">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span>{tip.rating}</span>
        </div>
        </div>
        </div>
        {/* Expandable Tip Details */}
        <div className="p-5">
        <button
        onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors mb-3"
        >
        <span>View Details</span>
        {expandedTip === tip.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
         <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
         <BookOpen className="w-4 h-4" />
         Steps
         </h4>
         <ol className="space-y-2">
         {tip.steps.map((step, idx) => (
          <li key={idx} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
          <span className="flex-shrink-0 w-5 h-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center text-xs font-semibold">
          {idx + 1}
          </span>
          <span className="flex-1 leading-relaxed">{step}</span>
          </li>
         ))}
         </ol>
         </div>
         {/* Supplies */}
         <div>
         <div className="flex items-center justify-between mb-2">
         <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
         <ShoppingCart className="w-4 h-4" />
         Supplies
         </h4>
         <button
         onClick={() => addToShoppingList(tip.supplies)}
         className="text-xs px-2 py-0.5 bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-400 rounded-md hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors font-medium"
         >
         Add All
         </button>
         </div>
         <ul className="space-y-1">
         {tip.supplies.map((supply, idx) => (
          <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <CircleDot className="w-1.5 h-1.5 fill-gray-400" />
          {supply}
          </li>
         ))}
         </ul>
         </div>
         {/* Pro Tip */}
         <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
         <div className="flex gap-2">
         <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
         <div>
         <h5 className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">Pro Tip</h5>
         <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{tip.proTip}</p>
         </div>
         </div>
         </div>
         {/* Share */}
         <button
         onClick={() => shareTip(tip)}
         className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-medium border border-gray-200 dark:border-gray-700"
         >
         <Share2 className="w-3.5 h-3.5" />
         Share
         </button>
         </motion.div>
        )}
        </AnimatePresence>
        </div>
        </div>
       ))}
       </div>
       </div>
      )}
      </div>
      </motion.div>
     )}
     </AnimatePresence>
     </motion.div>
     {/* Strategic CTA Banners between sections */}
     {index === 2 && (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1C294E] dark:bg-[#1C294E] rounded-2xl p-10 text-center"
      >
      <Shield className="w-12 h-12 text-[#079447] mx-auto mb-4" />
      <h3 className="text-3xl font-bold text-white mb-3">
      This Much Detail? We've Got You Covered
      </h3>
      <p className="text-white/90 text-lg max-w-2xl mx-auto mb-5">
      Feeling overwhelmed by these comprehensive checklists? That's exactly why Impress Cleaning Services exists. Our trained professionals handle every detail so you don't have to.
      </p>
      <p className="text-white/80 text-base max-w-xl mx-auto">
      We follow these exact protocols—and more—in every service we provide. Why spend your weekend cleaning when our experts can deliver superior results in a fraction of the time?
      </p>
      </motion.div>
     )}
     {index === 5 && (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1C294E] dark:bg-[#1C294E] rounded-2xl p-10 text-center"
      >
      <Clock className="w-12 h-12 text-[#079447] mx-auto mb-4" />
      <h3 className="text-3xl font-bold text-white mb-3">
      Skip the Checklist, Schedule the Service
      </h3>
      <p className="text-white/90 text-lg max-w-2xl mx-auto mb-4">
      By now you've seen how much work goes into professional-grade cleaning. The average homeowner spends <span className="text-[#079447] font-bold">8-10 hours per week</span> on cleaning tasks—time you'll never get back.
      </p>
      <p className="text-white/80 text-base max-w-xl mx-auto">
      Impress Cleaning delivers comprehensive, detail-oriented service that frees your schedule for what actually matters. Professional equipment, expert techniques, and guaranteed results.
      </p>
      </motion.div>
     )}
     {index === 8 && (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#079447] dark:bg-[#079447] rounded-2xl p-10 text-center"
      >
      <Award className="w-12 h-12 text-white mx-auto mb-4" />
      <h3 className="text-3xl font-bold text-white mb-3">
      Professional Standards, Guaranteed Results
      </h3>
      <p className="text-white/95 text-lg max-w-2xl mx-auto mb-5">
      These checklists represent real professional standards—not theoretical ideals. At Impress Cleaning, we don't cut corners or skip steps. Every surface, every detail, every time.
      </p>
      <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
      <div className="text-center">
      <div className="text-2xl font-bold text-white mb-1">100%</div>
      <div className="text-sm text-white/90">Satisfaction Guaranteed</div>
      </div>
      <div className="text-center">
      <div className="text-2xl font-bold text-white mb-1">Licensed</div>
      <div className="text-sm text-white/90">Fully Insured</div>
      </div>
      <div className="text-center">
      <div className="text-2xl font-bold text-white mb-1">Expert</div>
      <div className="text-sm text-white/90">Trained Professionals</div>
      </div>
      </div>
      </motion.div>
     )}
     {index === 11 && (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1C294E] dark:bg-[#1C294E] rounded-2xl p-10 text-center"
      >
      <Sparkles className="w-12 h-12 text-[#079447] mx-auto mb-4" />
      <h3 className="text-3xl font-bold text-white mb-3">
      Love a Clean Home, Hate the Work? We Understand
      </h3>
      <p className="text-white/90 text-lg max-w-2xl mx-auto mb-5">
      Everyone deserves a spotlessly clean home—without sacrificing their entire weekend. You've seen the scope of professional cleaning. Now imagine having it done for you, consistently and expertly.
      </p>
      <p className="text-white/80 text-base max-w-xl mx-auto">
      One service with Impress Cleaning and you'll wonder why you waited so long. Reclaim your weekends. Enjoy a professionally cleaned home. Live better.
      </p>
      </motion.div>
     )}
     {index === 14 && (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1C294E] dark:bg-[#1C294E] rounded-2xl p-10 text-center border-2 border-[#079447]"
      >
      <TrendingUp className="w-12 h-12 text-[#079447] mx-auto mb-4" />
      <h3 className="text-3xl font-bold text-white mb-3">
      Transform Your Home Without Lifting a Finger
      </h3>
      <p className="text-white/90 text-lg max-w-2xl mx-auto mb-5">
      You've explored <span className="text-[#079447] font-bold">15+ comprehensive cleaning guides</span> covering every room and situation. That's thousands of individual tasks, dozens of hours, and extensive expertise required.
      </p>
      <p className="text-white/80 text-base max-w-xl mx-auto mb-6">
      Or... you could simply call Impress Cleaning Services. We know these checklists by heart because we live them every day. Let us handle the complexity while you enjoy the results.
      </p>
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#079447] hover:bg-[#079447]/90 text-white rounded-xl font-semibold transition-colors cursor-pointer">
      <Shield className="w-5 h-5" />
      Experience the Impress Difference
      </div>
      </motion.div>
     )}
     </React.Fragment>
    );
   })}
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
    transition={{ delay: idx * 0.05 }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
    >
    <div className="flex items-center justify-between mb-4">
    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
    {product.category}
    </span>
    <div className="flex gap-2">
    {product.ecoFriendly && (
     <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
     <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
     </span>
    )}
    {product.budgetFriendly && (
     <span className="p-1.5 bg-blue-50 dark:bg-blue-950 rounded-lg">
     <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
     </span>
    )}
    </div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{product.bestFor}</p>
    <div className="space-y-4">
    <div>
    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Pros</h4>
    <ul className="space-y-1.5">
    {product.pros.map((pro, i) => (
     <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
     <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
     {pro}
     </li>
    ))}
    </ul>
    </div>
    <div>
    <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-2">Cons</h4>
    <ul className="space-y-1.5">
    {product.cons.map((con, i) => (
     <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
     <X className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
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
   <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
   <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
   <Calendar className="w-8 h-8" />
   Cleaning Schedule
   </h2>
   <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
   {['daily', 'weekly', 'monthly', 'quarterly'].map((freq) => {
    const tasksForFrequency = cleaningTipsData.filter(tip => tip.frequency === freq);
    return (
     <div key={freq} className="space-y-4">
     <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize pb-3 border-b-2 border-gray-900 dark:border-white">
     {freq}
     </h3>
     <ul className="space-y-3">
     {tasksForFrequency.map((tip) => (
      <li key={tip.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2.5">
      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
      <span className="leading-relaxed">{tip.title}</span>
      </li>
     ))}
     </ul>
     </div>
    );
   })}
   </div>
   <button className="mt-10 w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-base font-semibold">
   <Printer className="w-5 h-5" />
   Print Schedule
   </button>
   </div>
  )}
  </div>
  {/* Shopping List Modal */}
  <AnimatePresence>
  {showShoppingList && shoppingList.length > 0 && (
   <motion.div
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   exit={{ opacity: 0 }}
   className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
   onClick={() => setShowShoppingList(false)}
   >
   <motion.div
   initial={{ scale: 0.95, y: 20 }}
   animate={{ scale: 1, y: 0 }}
   exit={{ scale: 0.95, y: 20 }}
   onClick={(e) => e.stopPropagation()}
   className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
   >
   <div className="flex items-center justify-between mb-6">
   <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
   <ShoppingCart className="w-6 h-6" />
   Shopping List
   </h3>
   <button
   onClick={() => setShowShoppingList(false)}
   className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
   >
   <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
   </button>
   </div>
   <ul className="space-y-2 mb-6">
   {shoppingList.map((item, idx) => (
    <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <span className="text-gray-900 dark:text-white text-sm">{item}</span>
    <button
    onClick={() => removeFromShoppingList(item)}
    className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 p-1.5 rounded transition-colors"
    >
    <X className="w-4 h-4" />
    </button>
    </li>
   ))}
   </ul>
   <button
   onClick={() => {
    const text = shoppingList.join('\n');
    navigator.clipboard.writeText(text);
    alert('Shopping list copied!');
   }}
   className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold"
   >
   <Download className="w-5 h-5" />
   Copy to Clipboard
   </button>
   </motion.div>
   </motion.div>
  )}
  </AnimatePresence>
  {/* Footer */}
  <footer className="border-t border-gray-200 dark:border-gray-800 mt-20 bg-white dark:bg-gray-950">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div className="text-center text-gray-600 dark:text-gray-400">
  <p className="mb-2 text-sm">Professional cleaning solutions for modern homes</p>
  <p className="text-sm">© 2024 Cleaning Tips. All rights reserved.</p>
  </div>
  </div>
  </footer>
  </div>
 );
}
