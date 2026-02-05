'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FoodRecommendation () {
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMeal, setSelectedMeal] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('tab') === 'rekomendasi') {
      router.replace('/dashboard/food/recomendation')
    }
  }, [searchParams, router])

  // Data rekomendasi makanan
  const foodCategories = [
    { id: 'all', name: 'Semua', icon: '🍽️' },
    { id: 'breakfast', name: 'Sarapan', icon: '🍳' },
    { id: 'lunch', name: 'Makan Siang', icon: '🍲' },
    { id: 'dinner', name: 'Makan Malam', icon: '🍛' },
    { id: 'snack', name: 'Camilan', icon: '🍎' },
    { id: 'high_protein', name: 'High Protein', icon: '💪' },
    { id: 'low_calorie', name: 'Rendah Kalori', icon: '🥗' },
    { id: 'vegetarian', name: 'Vegetarian', icon: '🌱' },
    { id: 'indonesian', name: 'Masakan Indonesia', icon: '🇮🇩' },
    { id: 'quick', name: 'Cepat Saji', icon: '⚡' }
  ]

  const foodRecommendations = [
    {
      id: 1,
      name: 'Oatmeal dengan Buah Beri',
      category: 'breakfast',
      calories: 280,
      protein: 12,
      carbs: 45,
      fat: 8,
      image: '🥣',
      description:
        'Oatmeal creamy dengan campuran buah beri segar dan kacang-kacangan',
      ingredients: [
        'Oatmeal 50g',
        'Susu Almond 200ml',
        'Blueberry 50g',
        'Strawberry 50g',
        'Kacang Almond 20g',
        'Madu 1 sdt'
      ],
      instructions: [
        'Masak oatmeal dengan susu almond hingga creamy',
        'Tambahkan buah beri segar di atasnya',
        'Taburkan kacang almond cincang dan madu'
      ],
      nutrition: {
        fiber: 8,
        sugar: 12,
        sodium: 120
      },
      prepTime: 10,
      cookTime: 5,
      tags: ['Sehat', 'Tinggi Serat', 'Energi']
    },
    {
      id: 2,
      name: 'Salad Ayam Grill Mediterranean',
      category: 'lunch',
      calories: 420,
      protein: 35,
      carbs: 25,
      fat: 22,
      image: '🥗',
      description:
        'Salad segar dengan ayam grill, sayuran mediterranean, dan dressing zesty',
      ingredients: [
        'Ayam Fillet 150g',
        'Selada Romaine 100g',
        'Tomat Cherry 100g',
        'Mentimun 100g',
        'Zaitun 30g',
        'Feta Cheese 30g',
        'Dressing Lemon-Herb'
      ],
      instructions: [
        'Grill ayam fillet dengan bumbu mediterranean',
        'Campur semua sayuran dalam bowl besar',
        'Tambahkan ayam grill yang sudah dipotong',
        'Siram dengan dressing lemon-herb'
      ],
      nutrition: {
        fiber: 6,
        sugar: 8,
        sodium: 480
      },
      prepTime: 15,
      cookTime: 12,
      tags: ['High Protein', 'Segar', 'Mediterranean']
    },
    {
      id: 3,
      name: 'Salmon Teriyaki dengan Brokoli',
      category: 'dinner',
      calories: 380,
      protein: 32,
      carbs: 20,
      fat: 18,
      image: '🐟',
      description:
        'Salmon panggang dengan saus teriyaki homemade dan brokoli kukus',
      ingredients: [
        'Salmon Fillet 180g',
        'Brokoli 200g',
        'Kecap Tamari 2 sdm',
        'Madu 1 sdm',
        'Jahe Parut 1 sdt',
        'Bawang Putih 2 siung',
        'Minyak Wijen 1 sdt'
      ],
      instructions: [
        'Marinate salmon dengan saus teriyaki 30 menit',
        'Panggang salmon 8-10 menit per sisi',
        'Kukus brokoli hingga tender-crisp',
        'Siram dengan sisa saus teriyaki'
      ],
      nutrition: {
        fiber: 5,
        sugar: 10,
        sodium: 620
      },
      prepTime: 10,
      cookTime: 15,
      tags: ['Omega-3', 'High Protein', 'Jantung Sehat']
    },
    {
      id: 4,
      name: 'Greek Yogurt Protein Bowl',
      category: 'snack',
      calories: 220,
      protein: 25,
      carbs: 18,
      fat: 6,
      image: '🥛',
      description:
        'Greek yogurt dengan topping buah dan seeds untuk camilan tinggi protein',
      ingredients: [
        'Greek Yogurt 200g',
        'Whey Protein 1 scoop',
        'Berry Mix 100g',
        'Chia Seeds 1 sdm',
        'Flaxseed 1 sdm',
        'Madu 1 sdt'
      ],
      instructions: [
        'Campur greek yogurt dengan whey protein',
        'Tambahkan buah beri segar',
        'Taburkan chia seeds dan flaxseed',
        'Drizzle dengan madu'
      ],
      nutrition: {
        fiber: 7,
        sugar: 14,
        sodium: 85
      },
      prepTime: 5,
      cookTime: 0,
      tags: ['High Protein', 'Rendah Gula', 'Cepat']
    },
    {
      id: 5,
      name: 'Scrambled Eggs dengan Alpukat',
      category: 'breakfast',
      calories: 320,
      protein: 22,
      carbs: 12,
      fat: 22,
      image: '🥑',
      description:
        'Scrambled eggs creamy dengan alpukat matang dan roti gandum',
      ingredients: [
        'Telur 3 butir',
        'Alpukat 1 buah',
        'Roti Gandum 2 slice',
        'Susu 2 sdm',
        'Keju Parmesan 1 sdm',
        'Daun Bawang',
        'Garam & Merica'
      ],
      instructions: [
        'Kocok telur dengan susu, garam, dan merica',
        'Masak dengan api rendah hingga creamy',
        'Sajikan dengan alpukat iris dan roti gandum panggang',
        'Taburi keju parmesan dan daun bawang'
      ],
      nutrition: {
        fiber: 8,
        sugar: 3,
        sodium: 380
      },
      prepTime: 5,
      cookTime: 8,
      tags: ['High Protein', 'Lemak Sehat', 'Mengenyangkan']
    },
    {
      id: 6,
      name: 'Buddha Bowl Vegetarian',
      category: 'vegetarian',
      calories: 350,
      protein: 15,
      carbs: 55,
      fat: 12,
      image: '🍚',
      description:
        'Bowl bergizi dengan quinoa, sayuran panggang, dan tahini dressing',
      ingredients: [
        'Quinoa 100g',
        'Ubi Jalar 150g',
        'Brokoli 100g',
        'Chickpea 80g',
        'Alpukat 1/2 buah',
        'Tahini 2 sdm',
        'Lemon Juice 1 sdm'
      ],
      instructions: [
        'Masak quinoa sesuai petunjuk',
        'Panggang ubi jalar dan brokoli',
        'Tata semua bahan dalam bowl',
        'Siram dengan dressing tahini-lemon'
      ],
      nutrition: {
        fiber: 12,
        sugar: 9,
        sodium: 240
      },
      prepTime: 15,
      cookTime: 25,
      tags: ['Vegetarian', 'Tinggi Serat', 'Plant-based']
    },
    {
      id: 7,
      name: 'Protein Smoothie Hijau',
      category: 'snack',
      calories: 180,
      protein: 20,
      carbs: 22,
      fat: 3,
      image: '🥤',
      description:
        'Smoothie hijau rendah kalori dengan bayam dan protein powder',
      ingredients: [
        'Bayam 50g',
        'Pisang 1 buah',
        'Whey Protein 1 scoop',
        'Susu Almond 200ml',
        'Chia Seeds 1 sdt',
        'Es Batu'
      ],
      instructions: [
        'Blender semua bahan hingga halus',
        'Sajikan segera untuk nutrisi maksimal'
      ],
      nutrition: {
        fiber: 6,
        sugar: 15,
        sodium: 120
      },
      prepTime: 5,
      cookTime: 0,
      tags: ['Rendah Kalori', 'High Protein', 'Cepat']
    },
    {
      id: 8,
      name: 'Stir-fry Daging Sapi dengan Sayuran',
      category: 'dinner',
      calories: 450,
      protein: 38,
      carbs: 30,
      fat: 20,
      image: '🥩',
      description:
        'Stir-fry daging sapi tender dengan sayuran segar dan saus oyster',
      ingredients: [
        'Daging Sapi 200g',
        'Paprika 100g',
        'Brokoli 100g',
        'Wortel 80g',
        'Bawang Bombay 1/2 buah',
        'Saus Oyster 2 sdm',
        'Kecap Asin 1 sdm'
      ],
      instructions: [
        'Tumis daging sapi hingga matang',
        'Tambahkan sayuran dan tumis hingga tender-crisp',
        'Masukkan saus, masak sebentar',
        'Sajikan dengan nasi merah'
      ],
      nutrition: {
        fiber: 6,
        sugar: 8,
        sodium: 680
      },
      prepTime: 15,
      cookTime: 10,
      tags: ['High Protein', 'Zat Besi', 'Mengenyangkan']
    },
    {
      id: 9,
      name: 'Chia Pudding Chocolate',
      category: 'snack',
      calories: 190,
      protein: 8,
      carbs: 22,
      fat: 9,
      image: '🍫',
      description:
        'Chia pudding coklat dengan topping buah untuk camilan sehat',
      ingredients: [
        'Chia Seeds 40g',
        'Susu Almond 200ml',
        'Bubuk Coklat 1 sdm',
        'Madu 1 sdm',
        'Pisang 1/2 buah',
        'Almond Slice 1 sdm'
      ],
      instructions: [
        'Campur chia seeds dengan susu dan bubuk coklat',
        'Diamkan semalaman di kulkas',
        'Tambahkan topping pisang dan almond sebelum disajikan'
      ],
      nutrition: {
        fiber: 10,
        sugar: 12,
        sodium: 75
      },
      prepTime: 5,
      cookTime: 0,
      tags: ['Tinggi Serat', 'Rendah Gula', 'Make-ahead']
    },
    {
      id: 10,
      name: 'Quinoa Salad dengan Chickpea',
      category: 'lunch',
      calories: 380,
      protein: 18,
      carbs: 52,
      fat: 14,
      image: '🌱',
      description:
        'Salad quinoa dengan chickpea, sayuran, dan lemon vinaigrette',
      ingredients: [
        'Quinoa 100g',
        'Chickpea 100g',
        'Timun 100g',
        'Tomat 100g',
        'Daun Mint',
        'Lemon Juice 2 sdm',
        'Olive Oil 1 sdm'
      ],
      instructions: [
        'Masak quinoa dan dinginkan',
        'Campur dengan chickpea dan sayuran',
        'Siram dengan dressing lemon-olive oil',
        'Taburi daun mint segar'
      ],
      nutrition: {
        fiber: 11,
        sugar: 7,
        sodium: 280
      },
      prepTime: 10,
      cookTime: 15,
      tags: ['Vegetarian', 'Tinggi Serat', 'Segar']
    },
    // Menu 11-20
    {
      id: 11,
      name: 'Nasi Goreng Sehat',
      category: 'indonesian',
      calories: 380,
      protein: 25,
      carbs: 45,
      fat: 12,
      image: '🍚',
      description:
        'Nasi goreng dengan ayam, sayuran, dan bumbu tradisional yang lebih sehat',
      ingredients: [
        'Nasi Merah 150g',
        'Ayam Fillet 100g',
        'Wortel 50g',
        'Buncis 50g',
        'Telur 1 butir',
        'Kecap Manis 1 sdm',
        'Bawang Putih 3 siung'
      ],
      instructions: [
        'Tumis bawang putih hingga harum',
        'Masukkan ayam dan sayuran, tumis hingga matang',
        'Tambahkan nasi merah dan kecap',
        'Masukkan telur, aduk rata',
        'Sajikan dengan telur mata sapi'
      ],
      nutrition: {
        fiber: 6,
        sugar: 8,
        sodium: 450
      },
      prepTime: 10,
      cookTime: 15,
      tags: ['Indonesian', 'Sehat', 'Comfort Food']
    },
    {
      id: 12,
      name: 'Tahu Telur Kuah Kecap',
      category: 'indonesian',
      calories: 280,
      protein: 20,
      carbs: 15,
      fat: 16,
      image: '🧆',
      description:
        'Tahu dan telur dengan kuah kecap pedas manis khas Indonesia',
      ingredients: [
        'Tahu 200g',
        'Telur 2 butir',
        'Kecap Manis 2 sdm',
        'Cabe Rawit 5 buah',
        'Bawang Merah 3 siung',
        'Daun Bawang',
        'Air 200ml'
      ],
      instructions: [
        'Goreng tahu dan telur hingga matang',
        'Tumis bawang merah dan cabe',
        'Tambahkan air dan kecap, didihkan',
        'Masukkan tahu dan telur',
        'Taburi daun bawang'
      ],
      nutrition: {
        fiber: 3,
        sugar: 10,
        sodium: 520
      },
      prepTime: 10,
      cookTime: 12,
      tags: ['Indonesian', 'High Protein', 'Murah']
    },
    {
      id: 13,
      name: 'Capcay Kuah',
      category: 'indonesian',
      calories: 220,
      protein: 15,
      carbs: 25,
      fat: 8,
      image: '🥬',
      description: 'Capcay sayuran segar dengan kuah kaldu ayam yang gurih',
      ingredients: [
        'Wortel 100g',
        'Sawi Hijau 100g',
        'Brokoli 100g',
        'Jamur 80g',
        'Ayam Fillet 100g',
        'Bawang Putih 3 siung',
        'Kaldu Ayam 300ml'
      ],
      instructions: [
        'Tumis bawang putih hingga harum',
        'Masukkan ayam, tumis hingga matang',
        'Tambahkan sayuran, aduk rata',
        'Tuang kaldu, masak hingga sayuran matang',
        'Beri seasoning'
      ],
      nutrition: {
        fiber: 8,
        sugar: 6,
        sodium: 380
      },
      prepTime: 15,
      cookTime: 10,
      tags: ['Indonesian', 'Rendah Kalori', 'Tinggi Serat']
    },
    {
      id: 14,
      name: 'Gado-gado Salad',
      category: 'indonesian',
      calories: 320,
      protein: 18,
      carbs: 35,
      fat: 14,
      image: '🥗',
      description:
        'Salad Indonesia dengan bumbu kacang yang khas dan sayuran segar',
      ingredients: [
        'Tauge 100g',
        'Kangkung 100g',
        'Wortel 80g',
        'Tahu 100g',
        'Tempe 100g',
        'Telur 2 butir',
        'Bumbu Kacang 4 sdm'
      ],
      instructions: [
        'Rebus semua sayuran hingga matang',
        'Goreng tahu dan tempe',
        'Rebus telur hingga matang',
        'Tata di piring, siram dengan bumbu kacang'
      ],
      nutrition: {
        fiber: 9,
        sugar: 8,
        sodium: 420
      },
      prepTime: 20,
      cookTime: 15,
      tags: ['Indonesian', 'Vegetarian', 'Protein Nabati']
    },
    {
      id: 15,
      name: 'Soto Ayam Bening',
      category: 'indonesian',
      calories: 280,
      protein: 25,
      carbs: 20,
      fat: 12,
      image: '🍲',
      description: 'Soto ayam kuah bening dengan bumbu rempah yang menyehatkan',
      ingredients: [
        'Ayam 150g',
        'Soun 50g',
        'Tauge 80g',
        'Seledri',
        'Bawang Merah 4 siung',
        'Kunyit 2cm',
        'Jahe 2cm'
      ],
      instructions: [
        'Rebus ayam dengan bumbu halus',
        'Angkat ayam, suwir-suwir',
        'Tata soun dan tauge dalam mangkuk',
        'Siram dengan kuah soto',
        'Taburi seledri dan bawang goreng'
      ],
      nutrition: {
        fiber: 4,
        sugar: 3,
        sodium: 350
      },
      prepTime: 20,
      cookTime: 30,
      tags: ['Indonesian', 'Low Fat', 'Hangat']
    },
    {
      id: 16,
      name: 'Avocado Toast dengan Telur',
      category: 'breakfast',
      calories: 320,
      protein: 18,
      carbs: 25,
      fat: 18,
      image: '🥑',
      description:
        'Roti gandum panggang dengan alpukat tumbuk dan telur rebus sempurna',
      ingredients: [
        'Roti Gandum 2 slice',
        'Alpukat 1 buah',
        'Telur 2 butir',
        'Lemon Juice 1 sdt',
        'Paprika Bubuk',
        'Garam Laut'
      ],
      instructions: [
        'Panggang roti hingga kecoklatan',
        'Haluskan alpukat dengan lemon juice',
        'Rebus telur 7 menit untuk tekstur semi-rebus',
        'Oleskan alpukat pada roti',
        'Tambahkan telur dan seasoning'
      ],
      nutrition: {
        fiber: 9,
        sugar: 3,
        sodium: 280
      },
      prepTime: 5,
      cookTime: 10,
      tags: ['Quick', 'Sehat', 'Instagramable']
    },
    {
      id: 17,
      name: 'Smoothie Bowl Tropis',
      category: 'breakfast',
      calories: 290,
      protein: 15,
      carbs: 45,
      fat: 8,
      image: '🥥',
      description:
        'Smoothie bowl dengan rasa tropis dan topping buah-buahan segar',
      ingredients: [
        'Pisang 2 buah',
        'Mangga 100g',
        'Nanas 100g',
        'Greek Yogurt 150g',
        'Granola 30g',
        'Kelapa Parut 1 sdm'
      ],
      instructions: [
        'Blender pisang, mangga, nanas, dan yogurt',
        'Tuang ke dalam bowl',
        'Tambahkan topping granola dan kelapa parut',
        'Sajikan segera'
      ],
      nutrition: {
        fiber: 7,
        sugar: 25,
        sodium: 65
      },
      prepTime: 8,
      cookTime: 0,
      tags: ['Tropis', 'Segar', 'Vitamin C']
    },
    {
      id: 18,
      name: 'Protein Pancake',
      category: 'breakfast',
      calories: 350,
      protein: 30,
      carbs: 35,
      fat: 10,
      image: '🥞',
      description: 'Pancake tinggi protein dengan topping buah dan madu',
      ingredients: [
        'Oatmeal 50g',
        'Whey Protein 1 scoop',
        'Telur 2 butir',
        'Pisang 1 buah',
        'Baking Powder 1 sdt',
        'Madu 1 sdm'
      ],
      instructions: [
        'Blender semua bahan hingga halus',
        'Panaskan teflon anti lengket',
        'Tuang adonan, masak 2-3 menit per sisi',
        'Sajikan dengan topping favorit'
      ],
      nutrition: {
        fiber: 5,
        sugar: 15,
        sodium: 220
      },
      prepTime: 8,
      cookTime: 10,
      tags: ['High Protein', 'Mengenyangkan', 'Sehat']
    },
    {
      id: 19,
      name: 'Shakshuka Mediterranean',
      category: 'breakfast',
      calories: 280,
      protein: 18,
      carbs: 20,
      fat: 15,
      image: '🍅',
      description: 'Telur dimasak dalam saus tomat dengan rempah mediterranean',
      ingredients: [
        'Telur 3 butir',
        'Tomat 200g',
        'Paprika 100g',
        'Bawang Bombay 1/2 buah',
        'Paprika Bubuk 1 sdt',
        'Cumin 1/2 sdt',
        'Parsley'
      ],
      instructions: [
        'Tumis bawang bombay hingga harum',
        'Tambahkan tomat dan paprika, masak hingga lunak',
        'Buat cekungan, masukkan telur',
        'Tutup, masak 5-7 menit',
        'Taburi parsley'
      ],
      nutrition: {
        fiber: 6,
        sugar: 8,
        sodium: 320
      },
      prepTime: 10,
      cookTime: 15,
      tags: ['Mediterranean', 'High Protein', 'Kaya Lycopene']
    },
    {
      id: 20,
      name: 'Chia Seed French Toast',
      category: 'breakfast',
      calories: 310,
      protein: 20,
      carbs: 35,
      fat: 12,
      image: '🍞',
      description:
        'French toast sehat dengan tambahan chia seeds dan kayu manis',
      ingredients: [
        'Roti Gandum 2 slice',
        'Telur 2 butir',
        'Susu Almond 100ml',
        'Chia Seeds 1 sdm',
        'Kayu Manis 1 sdt',
        'Madu 1 sdm'
      ],
      instructions: [
        'Kocok telur, susu, chia seeds, dan kayu manis',
        'Rendam roti dalam campuran',
        'Panggang di teflon hingga kecoklatan',
        'Sajikan dengan madu'
      ],
      nutrition: {
        fiber: 8,
        sugar: 12,
        sodium: 180
      },
      prepTime: 8,
      cookTime: 8,
      tags: ['Sehat', 'Tinggi Serat', 'Comfort Food']
    },
    // Menu 21-30
    {
      id: 21,
      name: 'Grilled Chicken Caesar Salad',
      category: 'lunch',
      calories: 380,
      protein: 35,
      carbs: 15,
      fat: 22,
      image: '🥬',
      description: 'Salad caesar klasik dengan ayam grill dan dressing creamy',
      ingredients: [
        'Ayam Fillet 150g',
        'Romaine Lettuce 150g',
        'Crouton 30g',
        'Parmesan Cheese 20g',
        'Anchovy 2 buah',
        'Lemon Juice 1 sdm',
        'Olive Oil 2 sdm'
      ],
      instructions: [
        'Grill ayam dengan seasoning',
        'Campur selada dengan crouton',
        'Buat dressing caesar',
        'Tata di piring, tambahkan ayam',
        'Taburi parmesan'
      ],
      nutrition: {
        fiber: 4,
        sugar: 3,
        sodium: 580
      },
      prepTime: 12,
      cookTime: 10,
      tags: ['Klasik', 'High Protein', 'Creamy']
    },
    {
      id: 22,
      name: 'Quinoa Burrito Bowl',
      category: 'lunch',
      calories: 420,
      protein: 25,
      carbs: 50,
      fat: 15,
      image: '🌯',
      description: 'Bowl dengan rasa mexican, quinoa sebagai pengganti nasi',
      ingredients: [
        'Quinoa 100g',
        'Black Bean 80g',
        'Jagung 80g',
        'Alpukat 1/2 buah',
        'Salsa 3 sdm',
        'Greek Yogurt 2 sdm',
        'Lime Juice'
      ],
      instructions: [
        'Masak quinoa sesuai petunjuk',
        'Panaskan black bean dan jagung',
        'Tata quinoa dalam bowl',
        'Tambahkan topping',
        'Siram dengan salsa dan yogurt'
      ],
      nutrition: {
        fiber: 12,
        sugar: 6,
        sodium: 320
      },
      prepTime: 10,
      cookTime: 15,
      tags: ['Mexican', 'Tinggi Serat', 'Plant-based']
    },
    {
      id: 23,
      name: 'Tuna Sandwich Whole Wheat',
      category: 'lunch',
      calories: 320,
      protein: 28,
      carbs: 30,
      fat: 12,
      image: '🥪',
      description: 'Sandwich tuna dengan roti gandum dan sayuran segar',
      ingredients: [
        'Roti Gandum 2 slice',
        'Tuna Kaleng 120g',
        'Greek Yogurt 3 sdm',
        'Selada 2 lembar',
        'Tomat 2 slice',
        'Timun 4 slice',
        'Lemon Juice 1 sdt'
      ],
      instructions: [
        'Campur tuna dengan yogurt dan lemon',
        'Oleskan pada roti',
        'Tambah sayuran',
        'Tekan sandwich',
        'Sajikan'
      ],
      nutrition: {
        fiber: 6,
        sugar: 5,
        sodium: 480
      },
      prepTime: 8,
      cookTime: 0,
      tags: ['Quick', 'High Protein', 'Praktis']
    },
    {
      id: 24,
      name: 'Mie Shirataki dengan Jamur',
      category: 'low_calorie',
      calories: 120,
      protein: 8,
      carbs: 12,
      fat: 4,
      image: '🍜',
      description: 'Mie shirataki rendah kalori dengan tumis jamur dan sayuran',
      ingredients: [
        'Mie Shirataki 200g',
        'Jamur Shitake 100g',
        'Pakcoy 100g',
        'Bawang Putih 3 siung',
        'Kecap Tamari 1 sdm',
        'Minyak Wijen 1 sdt'
      ],
      instructions: [
        'Rendam mie shirataki, bilas',
        'Tumis bawang putih dan jamur',
        'Masukkan sayuran dan mie',
        'Tambahkan kecap',
        'Aduk rata'
      ],
      nutrition: {
        fiber: 6,
        sugar: 3,
        sodium: 380
      },
      prepTime: 5,
      cookTime: 8,
      tags: ['Rendah Kalori', 'Gluten Free', 'Diet']
    },
    {
      id: 25,
      name: 'Zucchini Noodles dengan Pesto',
      category: 'low_calorie',
      calories: 180,
      protein: 12,
      carbs: 15,
      fat: 10,
      image: '🥒',
      description:
        'Zucchini noodles dengan saus pesto homemade dan cherry tomato',
      ingredients: [
        'Zucchini 2 buah',
        'Basil 1 genggam',
        'Pine Nut 2 sdm',
        'Parmesan 2 sdm',
        'Olive Oil 2 sdm',
        'Bawang Putih 1 siung'
      ],
      instructions: [
        'Buat zucchini noodles dengan spiralizer',
        'Blender bahan pesto',
        'Campur zucchini dengan pesto',
        'Tambahkan cherry tomato',
        'Sajikan'
      ],
      nutrition: {
        fiber: 5,
        sugar: 8,
        sodium: 180
      },
      prepTime: 12,
      cookTime: 0,
      tags: ['Rendah Kalori', 'Segar', 'Vegetarian']
    },
    {
      id: 26,
      name: 'Egg Muffins Protein',
      category: 'snack',
      calories: 150,
      protein: 18,
      carbs: 5,
      fat: 8,
      image: '🧁',
      description: 'Muffin telur dengan sayuran, perfect untuk meal prep',
      ingredients: [
        'Telur 6 butir',
        'Bayam 50g',
        'Jamur 50g',
        'Paprika 50g',
        'Keju Feta 30g',
        'Susu 2 sdm',
        'Garam & Merica'
      ],
      instructions: [
        'Kocok telur dengan susu dan seasoning',
        'Tambahkan sayuran cincang',
        'Tuang ke cetakan muffin',
        'Taburi keju feta',
        'Panggang 20 menit 180°C'
      ],
      nutrition: {
        fiber: 2,
        sugar: 3,
        sodium: 320
      },
      prepTime: 10,
      cookTime: 20,
      tags: ['Meal Prep', 'High Protein', 'Portable']
    },
    {
      id: 27,
      name: 'Edamame Rebus dengan Garam',
      category: 'snack',
      calories: 120,
      protein: 11,
      carbs: 10,
      fat: 5,
      image: '🫘',
      description: 'Edamame rebus dengan garam laut, camilan tinggi protein',
      ingredients: ['Edamame 150g', 'Garam Laut 1 sdt', 'Air untuk merebus'],
      instructions: [
        'Rebus edamame 5 menit',
        'Tiriskan',
        'Taburi garam laut',
        'Sajikan hangat'
      ],
      nutrition: {
        fiber: 8,
        sugar: 2,
        sodium: 450
      },
      prepTime: 2,
      cookTime: 5,
      tags: ['High Protein', 'Vegan', 'Simple']
    },
    {
      id: 28,
      name: 'Protein Energy Balls',
      category: 'snack',
      calories: 180,
      protein: 12,
      carbs: 20,
      fat: 8,
      image: '🍫',
      description:
        'Energy balls dengan oats, protein powder, dan kacang-kacangan',
      ingredients: [
        'Oatmeal 100g',
        'Whey Protein 2 scoop',
        'Almond Butter 3 sdm',
        'Madu 2 sdm',
        'Chia Seeds 1 sdm',
        'Dark Chocolate Chips 2 sdm'
      ],
      instructions: [
        'Campur semua bahan',
        'Bentuk bulatan',
        'Dinginkan 30 menit',
        'Sajikan'
      ],
      nutrition: {
        fiber: 5,
        sugar: 10,
        sodium: 85
      },
      prepTime: 10,
      cookTime: 0,
      tags: ['Energy', 'No Bake', 'Portable']
    },
    {
      id: 29,
      name: 'Cucumber Slices dengan Hummus',
      category: 'snack',
      calories: 100,
      protein: 6,
      carbs: 12,
      fat: 4,
      image: '🥒',
      description: 'Irisan mentimun segar dengan hummus homemade',
      ingredients: [
        'Mentimun 1 buah',
        'Chickpea 100g',
        'Tahini 2 sdm',
        'Lemon Juice 1 sdm',
        'Bawang Putih 1 siung',
        'Olive Oil 1 sdm'
      ],
      instructions: [
        'Iris mentimun',
        'Blender bahan hummus',
        'Sajikan mentimun dengan hummus'
      ],
      nutrition: {
        fiber: 6,
        sugar: 4,
        sodium: 120
      },
      prepTime: 8,
      cookTime: 0,
      tags: ['Rendah Kalori', 'Segar', 'Vegan']
    },
    {
      id: 30,
      name: 'Apple Slices dengan Almond Butter',
      category: 'snack',
      calories: 160,
      protein: 6,
      carbs: 20,
      fat: 8,
      image: '🍎',
      description: 'Irisan apel dengan almond butter dan taburan kayu manis',
      ingredients: [
        'Apel 1 buah',
        'Almond Butter 2 sdm',
        'Kayu Manis 1/2 sdt',
        'Chia Seeds 1 sdt'
      ],
      instructions: [
        'Iris apel',
        'Oles almond butter',
        'Taburi kayu manis dan chia seeds',
        'Sajikan'
      ],
      nutrition: {
        fiber: 7,
        sugar: 15,
        sodium: 25
      },
      prepTime: 3,
      cookTime: 0,
      tags: ['Quick', 'Sehat', 'Natural Sugar']
    },
    // Menu 31-40
    {
      id: 31,
      name: 'Grilled Fish dengan Asparagus',
      category: 'dinner',
      calories: 320,
      protein: 35,
      carbs: 8,
      fat: 16,
      image: '🐟',
      description: 'Ikan putih grill dengan asparagus dan lemon butter sauce',
      ingredients: [
        'Ikan White Fish 200g',
        'Asparagus 150g',
        'Lemon 1/2 buah',
        'Butter 1 sdm',
        'Bawang Putih 2 siung',
        'Dill Segar'
      ],
      instructions: [
        'Season ikan dengan garam dan merica',
        'Grill ikan 4-5 menit per sisi',
        'Tumis asparagus dengan bawang putih',
        'Buat lemon butter sauce',
        'Sajikan'
      ],
      nutrition: {
        fiber: 4,
        sugar: 3,
        sodium: 280
      },
      prepTime: 8,
      cookTime: 12,
      tags: ['High Protein', 'Low Carb', 'Elegant']
    },
    {
      id: 32,
      name: 'Chicken Stir-fry dengan Kacang Panjang',
      category: 'dinner',
      calories: 350,
      protein: 32,
      carbs: 20,
      fat: 16,
      image: '🍗',
      description: 'Stir-fry ayam dengan kacang panjang dan saus tiram',
      ingredients: [
        'Ayam Fillet 180g',
        'Kacang Panjang 150g',
        'Bawang Putih 3 siung',
        'Saus Tiram 1 sdm',
        'Kecap Asin 1 sdm',
        'Minyak Wijen 1 sdt'
      ],
      instructions: [
        'Tumis bawang putih hingga harum',
        'Masukkan ayam, tumis hingga matang',
        'Tambahkan kacang panjang',
        'Beri saus, masak 2 menit',
        'Sajikan'
      ],
      nutrition: {
        fiber: 6,
        sugar: 5,
        sodium: 520
      },
      prepTime: 10,
      cookTime: 10,
      tags: ['Quick', 'High Protein', 'Asian']
    },
    {
      id: 33,
      name: 'Beef Bulgogi Bowl',
      category: 'dinner',
      calories: 420,
      protein: 35,
      carbs: 45,
      fat: 14,
      image: '🥩',
      description: 'Daging sapi bulgogi dengan nasi merah dan sayuran',
      ingredients: [
        'Daging Sapi 180g',
        'Nasi Merah 150g',
        'Wortel 80g',
        'Mentimun 80g',
        'Bawang Bombay 1/2 buah',
        'Saus Bulgogi 3 sdm'
      ],
      instructions: [
        'Marinate daging dengan saus bulgogi',
        'Grill daging hingga matang',
        'Tumis sayuran',
        'Tata nasi, sayuran, dan daging',
        'Sajikan'
      ],
      nutrition: {
        fiber: 7,
        sugar: 12,
        sodium: 580
      },
      prepTime: 15,
      cookTime: 12,
      tags: ['Korean', 'High Protein', 'Flavorful']
    },
    {
      id: 34,
      name: 'Vegetable Curry dengan Tahu',
      category: 'vegetarian',
      calories: 320,
      protein: 18,
      carbs: 35,
      fat: 14,
      image: '🍛',
      description: 'Curry sayuran dengan tahu dan santan rendah lemak',
      ingredients: [
        'Tahu 150g',
        'Wortel 100g',
        'Kentang 100g',
        'Kembang Kol 100g',
        'Santan 200ml',
        'Bumbu Curry 2 sdm'
      ],
      instructions: [
        'Tumis bumbu curry',
        'Masukkan sayuran, aduk rata',
        'Tambahkan santan',
        'Masukkan tahu',
        'Masak hingga matang'
      ],
      nutrition: {
        fiber: 8,
        sugar: 7,
        sodium: 320
      },
      prepTime: 12,
      cookTime: 20,
      tags: ['Vegetarian', 'Hangat', 'Aromatik']
    },
    {
      id: 35,
      name: 'Mushroom Risotto',
      category: 'vegetarian',
      calories: 380,
      protein: 12,
      carbs: 55,
      fat: 14,
      image: '🍄',
      description: 'Risotto creamy dengan jamur campuran dan parmesan',
      ingredients: [
        'Arborio Rice 100g',
        'Jamur Campuran 200g',
        'Kaldu Sayuran 500ml',
        'Bawang Bombay 1/2 buah',
        'Parmesan 3 sdm',
        'White Wine 50ml'
      ],
      instructions: [
        'Tumis bawang bombay',
        'Masukkan beras, aduk 2 menit',
        'Tuang wine, aduk hingga terserap',
        'Tambahkan kaldu bertahap',
        'Masukkan jamur dan parmesan'
      ],
      nutrition: {
        fiber: 6,
        sugar: 4,
        sodium: 420
      },
      prepTime: 10,
      cookTime: 25,
      tags: ['Creamy', 'Vegetarian', 'Italian']
    },
    {
      id: 36,
      name: 'Lentil Soup',
      category: 'vegetarian',
      calories: 280,
      protein: 18,
      carbs: 40,
      fat: 6,
      image: '🍲',
      description: 'Sup lentil dengan sayuran dan rempah-rempah',
      ingredients: [
        'Lentil 100g',
        'Wortel 100g',
        'Seledri 2 batang',
        'Bawang Bombay 1/2 buah',
        'Kaldu Sayuran 750ml',
        'Thyme 1 sdt'
      ],
      instructions: [
        'Tumis sayuran hingga layu',
        'Tambahkan lentil dan kaldu',
        'Didihkan, kecilkan api',
        'Masak 25-30 menit',
        'Sajikan'
      ],
      nutrition: {
        fiber: 15,
        sugar: 6,
        sodium: 280
      },
      prepTime: 10,
      cookTime: 30,
      tags: ['High Fiber', 'Comfort Food', 'Vegan']
    },
    {
      id: 37,
      name: 'Protein Waffle',
      category: 'breakfast',
      calories: 320,
      protein: 28,
      carbs: 30,
      fat: 10,
      image: '🧇',
      description: 'Waffle tinggi protein dengan topping buah beri',
      ingredients: [
        'Oatmeal 50g',
        'Whey Protein 1 scoop',
        'Telur 2 butir',
        'Greek Yogurt 3 sdm',
        'Baking Powder 1 sdt',
        'Berry Mix 100g'
      ],
      instructions: [
        'Blender semua bahan adonan',
        'Masak di waffle maker',
        'Sajikan dengan yogurt dan buah beri'
      ],
      nutrition: {
        fiber: 5,
        sugar: 8,
        sodium: 220
      },
      prepTime: 8,
      cookTime: 6,
      tags: ['High Protein', 'Sehat', 'Enak']
    },
    {
      id: 38,
      name: 'Breakfast Burrito',
      category: 'breakfast',
      calories: 380,
      protein: 25,
      carbs: 35,
      fat: 16,
      image: '🌯',
      description: 'Burrito sarapan dengan telur, sayuran, dan alpukat',
      ingredients: [
        'Tortilla Gandum 1 lembar',
        'Telur 3 butir',
        'Alpukat 1/2 buah',
        'Black Bean 50g',
        'Salsa 2 sdm',
        'Keju Cheddar 20g'
      ],
      instructions: [
        'Scramble telur',
        'Hangatkan tortilla',
        'Tata semua bahan',
        'Gulung burrito',
        'Panggang sebentar'
      ],
      nutrition: {
        fiber: 9,
        sugar: 4,
        sodium: 480
      },
      prepTime: 8,
      cookTime: 8,
      tags: ['Portable', 'Mengenyangkan', 'Mexican']
    },
    {
      id: 39,
      name: 'Chicken Satay dengan Salad',
      category: 'lunch',
      calories: 350,
      protein: 32,
      carbs: 18,
      fat: 18,
      image: '🍢',
      description: 'Sate ayam dengan bumbu kacang dan salad segar',
      ingredients: [
        'Ayam Fillet 180g',
        'Bumbu Kacang 4 sdm',
        'Timun 100g',
        'Bawang Merah 2 buah',
        'Kecap Manis 1 sdm',
        'Air Jeruk Nipis'
      ],
      instructions: [
        'Tusuk ayam',
        'Panggang hingga matang',
        'Sajikan dengan bumbu kacang',
        'Tambahkan timun dan bawang merah'
      ],
      nutrition: {
        fiber: 4,
        sugar: 8,
        sodium: 420
      },
      prepTime: 15,
      cookTime: 10,
      tags: ['Indonesian', 'High Protein', 'Grilled']
    },
    {
      id: 40,
      name: 'Tempe Mendoan Sehat',
      category: 'snack',
      calories: 220,
      protein: 15,
      carbs: 20,
      fat: 10,
      image: '🧆',
      description:
        'Tempe mendoan dengan tepung whole wheat dan bumbu tradisional',
      ingredients: [
        'Tempe 150g',
        'Tepung Gandum 50g',
        'Ketumbar 1 sdt',
        'Bawang Putih 2 siung',
        'Air 80ml',
        'Minyak untuk menggoreng'
      ],
      instructions: [
        'Iris tempe tipis',
        'Buat adonan tepung',
        'Celupkan tempe',
        'Goreng hingga kecoklatan',
        'Sajikan dengan cabe rawit'
      ],
      nutrition: {
        fiber: 6,
        sugar: 2,
        sodium: 180
      },
      prepTime: 10,
      cookTime: 8,
      tags: ['Indonesian', 'Protein Nabati', 'Crispy']
    },
    // Menu 41-50
    {
      id: 41,
      name: 'Berry Chia Jam Yogurt',
      category: 'snack',
      calories: 140,
      protein: 12,
      carbs: 18,
      fat: 4,
      image: '🫐',
      description: 'Greek yogurt dengan chia jam buah beri homemade',
      ingredients: [
        'Greek Yogurt 150g',
        'Mixed Berries 100g',
        'Chia Seeds 1 sdm',
        'Madu 1 sdt',
        'Lemon Juice 1 sdt'
      ],
      instructions: [
        'Masak beri dengan madu dan lemon',
        'Tambahkan chia seeds, diamkan',
        'Layer dengan yogurt',
        'Sajikan'
      ],
      nutrition: {
        fiber: 7,
        sugar: 12,
        sodium: 65
      },
      prepTime: 5,
      cookTime: 5,
      tags: ['Antioxidant', 'High Protein', 'Simple']
    },
    {
      id: 42,
      name: 'Coconut Water Electrolyte Drink',
      category: 'snack',
      calories: 60,
      protein: 2,
      carbs: 12,
      fat: 0,
      image: '🥥',
      description: 'Minuman elektrolit alami dengan air kelapa dan buah',
      ingredients: [
        'Air Kelapa 300ml',
        'Jeruk Nipis 1 buah',
        'Madu 1 sdt',
        'Garam Himalaya 1/4 sdt',
        'Mint Leaves'
      ],
      instructions: [
        'Campur semua bahan',
        'Aduk hingga madu larut',
        'Tambahkan es batu',
        'Hias dengan mint'
      ],
      nutrition: {
        fiber: 1,
        sugar: 10,
        sodium: 120
      },
      prepTime: 3,
      cookTime: 0,
      tags: ['Hydration', 'Natural', 'Refreshing']
    },
    {
      id: 43,
      name: 'Protein Coffee Shake',
      category: 'snack',
      calories: 120,
      protein: 20,
      carbs: 8,
      fat: 2,
      image: '☕',
      description: 'Kopi dingin dengan protein powder untuk energi',
      ingredients: [
        'Kopi Dingin 200ml',
        'Whey Protein 1 scoop',
        'Es Batu',
        'Kayu Manis 1/4 sdt'
      ],
      instructions: ['Blender semua bahan', 'Sajikan segera'],
      nutrition: {
        fiber: 1,
        sugar: 2,
        sodium: 85
      },
      prepTime: 3,
      cookTime: 0,
      tags: ['Energy', 'Low Calorie', 'Pre-workout']
    },
    {
      id: 44,
      name: 'Vegetable Frittata',
      category: 'breakfast',
      calories: 280,
      protein: 22,
      carbs: 12,
      fat: 18,
      image: '🍳',
      description: 'Frittata dengan sayuran campuran dan keju',
      ingredients: [
        'Telur 4 butir',
        'Brokoli 80g',
        'Paprika 80g',
        'Bawang Bombay 1/4 buah',
        'Keju Mozzarella 30g',
        'Susu 2 sdm'
      ],
      instructions: [
        'Tumis sayuran',
        'Kocok telur dengan susu',
        'Tuang ke wajan',
        'Taburi keju',
        'Panggang 15 menit'
      ],
      nutrition: {
        fiber: 3,
        sugar: 4,
        sodium: 280
      },
      prepTime: 8,
      cookTime: 18,
      tags: ['High Protein', 'Vegetarian', 'Oven-baked']
    },
    {
      id: 45,
      name: 'Salmon Patties',
      category: 'dinner',
      calories: 290,
      protein: 28,
      carbs: 10,
      fat: 16,
      image: '🐟',
      description: 'Patties salmon dengan herbs dan lemon zest',
      ingredients: [
        'Salmon 200g',
        'Breadcrumbs 30g',
        'Telur 1 butir',
        'Dill 1 sdm',
        'Lemon Zest 1 sdt',
        'Bawang Merah 2 sdm'
      ],
      instructions: [
        'Campur semua bahan',
        'Bentuk patties',
        'Panggang 8-10 menit per sisi',
        'Sajikan dengan salad'
      ],
      nutrition: {
        fiber: 2,
        sugar: 1,
        sodium: 320
      },
      prepTime: 12,
      cookTime: 16,
      tags: ['High Protein', 'Omega-3', 'Crispy']
    },
    {
      id: 46,
      name: 'Chicken Vegetable Skewers',
      category: 'dinner',
      calories: 320,
      protein: 35,
      carbs: 15,
      fat: 14,
      image: '🍢',
      description: 'Tusukan ayam dan sayuran dengan marinade herbs',
      ingredients: [
        'Ayam Fillet 180g',
        'Paprika 100g',
        'Zucchini 100g',
        'Bawang Bombay 1/2 buah',
        'Olive Oil 2 sdm',
        'Herbs Provencal 1 sdm'
      ],
      instructions: [
        'Potong bahan menjadi kubus',
        'Marinate dengan bumbu',
        'Tusuk bergantian',
        'Grill 10-12 menit',
        'Sajikan'
      ],
      nutrition: {
        fiber: 4,
        sugar: 6,
        sodium: 220
      },
      prepTime: 15,
      cookTime: 12,
      tags: ['Grilled', 'High Protein', 'Colorful']
    },
    {
      id: 47,
      name: 'Egg Drop Soup',
      category: 'low_calorie',
      calories: 90,
      protein: 12,
      carbs: 5,
      fat: 3,
      image: '🍲',
      description: 'Sup telur dengan kaldu ayam dan daun bawang',
      ingredients: [
        'Kaldu Ayam 400ml',
        'Telur 2 butir',
        'Daun Bawang 2 batang',
        'Jahe 1cm',
        'Kecap Asin 1 sdt',
        'Minyak Wijen 1/2 sdt'
      ],
      instructions: [
        'Didihkan kaldu dengan jahe',
        'Kocok telur',
        'Tuang telur sambil diaduh',
        'Tambahkan daun bawang',
        'Sajikan'
      ],
      nutrition: {
        fiber: 1,
        sugar: 2,
        sodium: 380
      },
      prepTime: 3,
      cookTime: 8,
      tags: ['Low Calorie', 'Comfort Food', 'Quick']
    },
    {
      id: 48,
      name: 'Cabbage Rolls',
      category: 'dinner',
      calories: 280,
      protein: 22,
      carbs: 20,
      fat: 12,
      image: '🥬',
      description: 'Gulungan kubis dengan isian daging dan nasi merah',
      ingredients: [
        'Daun Kubis 8 lembar',
        'Daging Cincang 150g',
        'Nasi Merah 50g',
        'Tomat 200g',
        'Bawang Bombay 1/2 buah',
        'Kaldu 200ml'
      ],
      instructions: [
        'Rebus daun kubis hingga layu',
        'Campur isian',
        'Gulung daun kubis',
        'Susun dalam panci',
        'Masak dengan saus tomat 30 menit'
      ],
      nutrition: {
        fiber: 6,
        sugar: 8,
        sodium: 320
      },
      prepTime: 20,
      cookTime: 35,
      tags: ['Comfort Food', 'High Fiber', 'Traditional']
    },
    {
      id: 49,
      name: 'Protein Ice Cream',
      category: 'snack',
      calories: 180,
      protein: 20,
      carbs: 15,
      fat: 6,
      image: '🍦',
      description: 'Ice cream tinggi protein dengan rasa vanilla',
      ingredients: [
        'Greek Yogurt 200g',
        'Whey Protein 1 scoop',
        'Madu 1 sdm',
        'Vanilla Extract 1 sdt',
        'Es Batu'
      ],
      instructions: [
        'Blender semua bahan',
        'Bekukan 2-3 jam',
        'Aduk setiap 30 menit',
        'Sajikan'
      ],
      nutrition: {
        fiber: 0,
        sugar: 12,
        sodium: 85
      },
      prepTime: 5,
      cookTime: 0,
      tags: ['Dessert', 'High Protein', 'Guilt-free']
    },
    {
      id: 50,
      name: 'Overnight Oats Chocolate',
      category: 'breakfast',
      calories: 320,
      protein: 18,
      carbs: 45,
      fat: 10,
      image: '🥣',
      description: 'Overnight oats dengan coklat dan pisang',
      ingredients: [
        'Oatmeal 60g',
        'Susu Almond 200ml',
        'Bubuk Coklat 1 sdm',
        'Pisang 1 buah',
        'Chia Seeds 1 sdm',
        'Madu 1 sdt'
      ],
      instructions: [
        'Campur semua bahan',
        'Simpan di kulkas semalaman',
        'Tambahkan topping pisang',
        'Sajikan dingin'
      ],
      nutrition: {
        fiber: 9,
        sugar: 18,
        sodium: 95
      },
      prepTime: 5,
      cookTime: 0,
      tags: ['Meal Prep', 'Sehat', 'Enak']
    }
  ]

  // Filter makanan berdasarkan kategori dan pencarian
  const filteredFoods = foodRecommendations.filter(food => {
    const matchesCategory =
      selectedCategory === 'all' || food.category === selectedCategory
    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    return matchesCategory && matchesSearch
  })

  const handleLogout = () => {
    console.log('Logout clicked')
  }

  const addToMealPlan = food => {
    console.log('Added to meal plan:', food.name)
    // Logic untuk menambahkan ke meal plan
  }

  const viewDetails = food => {
    setSelectedMeal(food)
  }

  const closeDetails = () => {
    setSelectedMeal(null)
  }

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          {/* Header Section */}
          <div style={styles.headerSection}>
            <h1 style={styles.pageTitle}>Resep Makanan Sehat</h1>
            <p style={styles.pageSubtitle}>
              Temukan 50+ inspirasi makanan bergizi yang sesuai dengan tujuan
              fitness Anda
            </p>
          </div>

          {/* Search Bar */}
          <div style={styles.searchSection}>
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type='text'
                placeholder='Cari makanan, bahan, atau kategori...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div style={styles.categorySection}>
            <h3 style={styles.sectionTitle}>Kategori Makanan</h3>
            <div style={styles.categoryGrid}>
              {foodCategories.map(category => (
                <button
                  key={category.id}
                  style={{
                    ...styles.categoryButton,
                    ...(selectedCategory === category.id
                      ? styles.activeCategoryButton
                      : {})
                  }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span style={styles.categoryIcon}>{category.icon}</span>
                  <span style={styles.categoryName}>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Food Recommendations Grid */}
          <div style={styles.foodSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                {selectedCategory === 'all'
                  ? 'Semua Rekomendasi'
                  : `Rekomendasi ${
                      foodCategories.find(cat => cat.id === selectedCategory)
                        ?.name
                    }`}
                <span style={styles.resultCount}>
                  {' '}
                  ({filteredFoods.length} hasil)
                </span>
              </h3>
              <div style={styles.sortOptions}>
                <select style={styles.sortSelect}>
                  <option>Urutkan: Terpopuler</option>
                  <option>Kalori: Rendah ke Tinggi</option>
                  <option>Kalori: Tinggi ke Rendah</option>
                  <option>Protein: Tinggi ke Rendah</option>
                </select>
              </div>
            </div>

            {filteredFoods.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🍽️</div>
                <h4 style={styles.emptyTitle}>Tidak ada makanan ditemukan</h4>
                <p style={styles.emptyDescription}>
                  Coba ubah kata kunci pencarian atau pilih kategori lain
                </p>
              </div>
            ) : (
              <div style={styles.foodGrid}>
                {filteredFoods.map(food => (
                  <div key={food.id} style={styles.foodCard}>
                    <div style={styles.foodHeader}>
                      <div style={styles.foodImage}>{food.image}</div>
                      <div style={styles.foodInfo}>
                        <h4 style={styles.foodName}>{food.name}</h4>
                        <p style={styles.foodDescription}>{food.description}</p>
                        <div style={styles.foodMeta}>
                          <span style={styles.prepTime}>
                            ⏱️ {food.prepTime + food.cookTime} menit
                          </span>
                          <span style={styles.mealTag}>
                            {
                              foodCategories.find(
                                cat => cat.id === food.category
                              )?.icon
                            }
                            {
                              foodCategories.find(
                                cat => cat.id === food.category
                              )?.name
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.nutritionInfo}>
                      <div style={styles.nutritionItem}>
                        <span style={styles.nutritionValue}>
                          {food.calories}
                        </span>
                        <span style={styles.nutritionLabel}>Kalori</span>
                      </div>
                      <div style={styles.nutritionItem}>
                        <span style={styles.nutritionValue}>
                          {food.protein}g
                        </span>
                        <span style={styles.nutritionLabel}>Protein</span>
                      </div>
                      <div style={styles.nutritionItem}>
                        <span style={styles.nutritionValue}>{food.carbs}g</span>
                        <span style={styles.nutritionLabel}>Karbo</span>
                      </div>
                      <div style={styles.nutritionItem}>
                        <span style={styles.nutritionValue}>{food.fat}g</span>
                        <span style={styles.nutritionLabel}>Lemak</span>
                      </div>
                    </div>

                    <div style={styles.tagsSection}>
                      <div style={styles.tagsList}>
                        {food.tags.map((tag, index) => (
                          <span key={index} style={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={styles.foodActions}>
                      <button
                        style={styles.addButton}
                        onClick={() => addToMealPlan(food)}
                      >
                        ➕ Tambah ke Meal Plan
                      </button>
                      <button
                        style={styles.detailButton}
                        onClick={() => viewDetails(food)}
                      >
                        📋 Lihat Resep
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nutrition Tips */}
          <div style={styles.tipsSection}>
            <h3 style={styles.sectionTitle}>Tips Nutrisi Sehat</h3>
            <div style={styles.tipsGrid}>
              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>💧</div>
                <h4 style={styles.tipTitle}>Hidrasi Optimal</h4>
                <p style={styles.tipDescription}>
                  Minum 2-3 liter air per hari. Tambahkan lemon atau mint untuk
                  variasi.
                </p>
              </div>
              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>⏰</div>
                <h4 style={styles.tipTitle}>Jadwal Makan Teratur</h4>
                <p style={styles.tipDescription}>
                  Makan setiap 3-4 jam untuk menjaga metabolisme dan energi
                  stabil.
                </p>
              </div>
              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>🥦</div>
                <h4 style={styles.tipTitle}>Porsi Sayuran</h4>
                <p style={styles.tipDescription}>
                  Isi setengah piring dengan sayuran berwarna-warni untuk
                  vitamin dan serat.
                </p>
              </div>
              <div style={styles.tipCard}>
                <div style={styles.tipIcon}>⚖️</div>
                <h4 style={styles.tipTitle}>Balance Makronutrien</h4>
                <p style={styles.tipDescription}>
                  Kombinasikan protein, karbo kompleks, dan lemak sehat setiap
                  makan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedMeal.name}</h2>
              <button style={styles.closeButton} onClick={closeDetails}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.mealOverview}>
                <div style={styles.mealImage}>{selectedMeal.image}</div>
                <div style={styles.mealInfo}>
                  <p style={styles.mealDescription}>
                    {selectedMeal.description}
                  </p>
                  <div style={styles.mealStats}>
                    <span>
                      ⏱️ Prep: {selectedMeal.prepTime}m | Cook:{' '}
                      {selectedMeal.cookTime}m
                    </span>
                    <span>
                      🍽️{' '}
                      {
                        foodCategories.find(
                          cat => cat.id === selectedMeal.category
                        )?.name
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.detailGrid}>
                <div style={styles.detailSection}>
                  <h4 style={styles.detailTitle}>Bahan-bahan</h4>
                  <ul style={styles.ingredientsList}>
                    {selectedMeal.ingredients.map((ingredient, index) => (
                      <li key={index} style={styles.ingredientItem}>
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={styles.detailSection}>
                  <h4 style={styles.detailTitle}>Cara Membuat</h4>
                  <ol style={styles.instructionsList}>
                    {selectedMeal.instructions.map((instruction, index) => (
                      <li key={index} style={styles.instructionItem}>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div style={styles.nutritionDetail}>
                <h4 style={styles.detailTitle}>Informasi Gizi</h4>
                <div style={styles.nutritionGrid}>
                  <div style={styles.nutritionItemDetail}>
                    <span>Kalori</span>
                    <span>{selectedMeal.calories}</span>
                  </div>
                  <div style={styles.nutritionItemDetail}>
                    <span>Protein</span>
                    <span>{selectedMeal.protein}g</span>
                  </div>
                  <div style={styles.nutritionItemDetail}>
                    <span>Karbohidrat</span>
                    <span>{selectedMeal.carbs}g</span>
                  </div>
                  <div style={styles.nutritionItemDetail}>
                    <span>Lemak</span>
                    <span>{selectedMeal.fat}g</span>
                  </div>
                  <div style={styles.nutritionItemDetail}>
                    <span>Serat</span>
                    <span>{selectedMeal.nutrition.fiber}g</span>
                  </div>
                  <div style={styles.nutritionItemDetail}>
                    <span>Gula</span>
                    <span>{selectedMeal.nutrition.sugar}g</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.primaryButton}
                onClick={() => addToMealPlan(selectedMeal)}
              >
                ➕ Tambah ke Meal Plan Hari Ini
              </button>
              <button style={styles.secondaryButton} onClick={closeDetails}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Styles tetap sama seperti sebelumnya
const styles = {
  container: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '1rem 0',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 1000,
    transition: 'all 0.3s ease'
  },
  navScrolled: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '0.75rem 0'
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem'
  },
  logoSection: {
    flex: '0 0 auto'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: '700',
    textDecoration: 'none'
  },
  logoImageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoImage: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    objectFit: 'contain'
  },
  logoText: {
    background: 'linear-gradient(135deg, #70c1b3 0%, #247ba0 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  menuSection: {
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem'
  },
  menuLink: {
    color: '#374151',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  activeMenuLink: {
    color: '#247ba0',
    backgroundColor: 'rgba(36, 123, 160, 0.1)'
  },
  profileSection: {
    flex: '0 0 auto'
  },
  profileDropdown: {
    position: 'relative',
    display: 'inline-block'
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#374151'
  },
  profileAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#247ba0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  avatarText: {
    color: 'white'
  },
  profileName: {
    fontWeight: '500'
  },
  dropdownArrow: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    minWidth: '200px',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e5e7eb',
    padding: '0.5rem 0',
    opacity: 0,
    visibility: 'hidden',
    transform: 'translateY(-10px)',
    transition: 'all 0.3s ease',
    zIndex: 1001
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    textDecoration: 'none',
    color: '#374151',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem'
  },
  mainContent: {
    marginTop: '80px',
    minHeight: 'calc(100vh - 80px)',
    padding: '2rem 1rem'
  },
  contentContainer: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  headerSection: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem'
  },
  pageSubtitle: {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto'
  },
  searchSection: {
    marginBottom: '2rem'
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '500px',
    margin: '0 auto'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.25rem',
    color: '#6b7280'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 3rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  categorySection: {
    marginBottom: '3rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1.5rem'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem'
  },
  categoryButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0.5rem',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  activeCategoryButton: {
    borderColor: '#247ba0',
    backgroundColor: 'rgba(36, 123, 160, 0.05)'
  },
  categoryIcon: {
    fontSize: '1.5rem'
  },
  categoryName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  foodSection: {
    marginBottom: '3rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  resultCount: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: 'normal'
  },
  sortOptions: {
    display: 'flex',
    gap: '1rem'
  },
  sortSelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: 'white'
  },
  foodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1.5rem'
  },
  foodCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease'
  },
  foodHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem'
  },
  foodImage: {
    fontSize: '3rem',
    flexShrink: 0
  },
  foodInfo: {
    flex: 1
  },
  foodName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  foodDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: 1.5,
    marginBottom: '0.75rem'
  },
  foodMeta: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  prepTime: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  mealTag: {
    fontSize: '0.75rem',
    color: '#247ba0',
    backgroundColor: 'rgba(36, 123, 160, 0.1)',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px'
  },
  nutritionInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  nutritionItem: {
    textAlign: 'center'
  },
  nutritionValue: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#247ba0'
  },
  nutritionLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem'
  },
  tagsSection: {
    marginBottom: '1rem'
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  tag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  foodActions: {
    display: 'flex',
    gap: '0.75rem'
  },
  addButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#247ba0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  detailButton: {
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    color: '#247ba0',
    border: '1px solid #247ba0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  emptyDescription: {
    color: '#6b7280'
  },
  tipsSection: {
    marginBottom: '2rem'
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },
  tipCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  tipIcon: {
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  tipTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  tipDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: 1.5
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1002,
    padding: '2rem'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'all 0.3s ease'
  },
  modalBody: {
    padding: '2rem'
  },
  mealOverview: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem'
  },
  mealImage: {
    fontSize: '4rem',
    flexShrink: 0
  },
  mealInfo: {
    flex: 1
  },
  mealDescription: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '1rem'
  },
  mealStats: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem'
  },
  detailSection: {
    flex: 1
  },
  detailTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem'
  },
  ingredientsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  ingredientItem: {
    padding: '0.5rem 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.875rem',
    color: '#374151'
  },
  instructionsList: {
    paddingLeft: '1.5rem',
    margin: 0
  },
  instructionItem: {
    padding: '0.5rem 0',
    fontSize: '0.875rem',
    color: '#374151',
    lineHeight: 1.5
  },
  nutritionDetail: {
    marginBottom: '2rem'
  },
  nutritionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem'
  },
  nutritionItemDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '0.875rem'
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem 2rem',
    borderTop: '1px solid #e5e7eb'
  },
  primaryButton: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    backgroundColor: '#247ba0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  }
}

// CSS untuk hover effects
const stylesheet = `
  .profile-dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .profile-button:hover {
    background-color: rgba(36, 123, 160, 0.1);
  }

  .menu-link:hover {
    color: #247ba0;
    background-color: rgba(36, 123, 160, 0.05);
  }

  .dropdown-item:hover {
    background-color: #f3f4f6;
    color: #247ba0;
  }

  .search-input:focus {
    border-color: #247ba0;
    box-shadow: 0 0 0 3px rgba(36, 123, 160, 0.1);
  }

  .category-button:hover {
    border-color: #247ba0;
    transform: translateY(-2px);
  }

  .food-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  .add-button:hover {
    background-color: #1a5a7a;
    transform: translateY(-1px);
  }

  .detail-button:hover {
    background-color: #247ba0;
    color: white;
  }

  .tip-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  }

  .close-button:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  .primary-button:hover {
    background-color: #1a5a7a;
    transform: translateY(-1px);
  }

  .secondary-button:hover {
    background-color: #f3f4f6;
  }

  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.innerText = stylesheet
  document.head.appendChild(styleSheet)
}
