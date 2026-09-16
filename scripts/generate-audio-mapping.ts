// scripts/generate-audio-mapping.ts
// Run: npx ts-node scripts/generate-audio-mapping.ts

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// CONFIGURATION
// ============================================================

const WORLDS = 10; // World 1-10
const LESSONS_PER_WORLD = 10; // Each world has 10 lessons
const EXERCISES_PER_LESSON = 17; // Each lesson has 17 exercises (e0-e16)

const OUTPUT_FILE = 'src/lib/content/audio-mapping.ts';

// ============================================================
// GENERATE MAPPINGS
// ============================================================

interface Mapping {
  key: string;
  value: string;
}

function generateMappings(): Mapping[] {
  const mappings: Mapping[] = [];
  let counter = 1;

  // ============================================================
  // 1. GREETINGS (w1_l1 - w1_l10 use greet_* keys)
  // ============================================================
  const greetKeys = [
    'greet_hello', 'greet_hi', 'greet_morning', 'greet_day', 
    'greet_evening', 'greet_night', 'greet_bye', 'greet_seeyou',
    'greet_welcome', 'greet_pleasure', 'greet_meet', 'greet_name',
    'greet_friend', 'greet_mr', 'greet_mrs', 'greet_thanks',
    'greet_please', 'greet_sorry', 'greet_yes', 'greet_no',
    'greet_how', 'greet_good', 'greet_fine', 'greet_bad',
    'greet_okay'
  ];

  // w1_l1 uses greet_* keys
  for (let i = 0; i < greetKeys.length && i < 17; i++) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key: `w1_l1_e${i}`, value: greetKeys[i] });
    counter++;
  }

  // w1_l2 - w1_l10 reuse greet_* keys
  for (let lesson = 2; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const key = `w1_l${lesson}_e${exercise}`;
      const value = greetKeys[exercise % greetKeys.length];
      mappings.push({ key, value });
      counter++;
    }
  }

  // ============================================================
  // 2. WORLD 2-10 (w2_l1 to w10_l10)
  // ============================================================
  // Generate unique keys based on world, lesson, exercise
  const prefixes = [
    'home', 'room', 'fur', 'food', 'drink', 'rest', 'shop', 'cloth', 'weather', 'time', // w2
    'air', 'taxi', 'hotel', 'dir', 'train', 'bus', 'tour', 'emer', // w3
    'sch', 'uni', 'off', 'pro', 'mtg', 'tech', // w4
    'op', 'em', 'st', 'ps', 'neg', 'cul', // w5
    'hob', // w6
    'tec', // w7
    'env', // w8
    'biz', // w9
    'art' // w10
  ];

  const worldPrefixes: Record<number, string[]> = {
    2: ['home', 'room', 'fur', 'food', 'drink', 'rest', 'shop', 'cloth', 'weather', 'time'],
    3: ['air', 'taxi', 'hotel', 'dir', 'train', 'bus', 'tour', 'emer'],
    4: ['sch', 'uni', 'off', 'pro', 'mtg', 'tech'],
    5: ['op', 'em', 'st', 'ps', 'neg', 'cul'],
    6: ['hob'],
    7: ['tec'],
    8: ['env'],
    9: ['biz'],
    10: ['art'],
  };

  // Generate mappings for worlds 2-10
  for (let world = 2; world <= WORLDS; world++) {
    const prefixes = worldPrefixes[world] || [`w${world}`];
    
    for (let lesson = 1; lesson <= LESSONS_PER_WORLD; lesson++) {
      const prefix = prefixes[(lesson - 1) % prefixes.length];
      
      for (let exercise = 0; exercise < EXERCISES_PER_LESSON; exercise++) {
        const key = `w${world}_l${lesson}_e${exercise}`;
        // Use numeric value for worlds 2-10
        const num = String(counter).padStart(6, '0');
        mappings.push({ key, value: num });
        counter++;
      }
    }
  }

  console.log(`✅ Generated ${mappings.length} mappings`);
  return mappings;
}

// ============================================================
// GENERATE ALL VOCABULARY MAPPINGS
// ============================================================

function generateAllVocabMappings(): Mapping[] {
  const mappings: Mapping[] = [];
  let counter = 1;

  // ============================================================
  // WORLD 1: GREETINGS (vocab IDs)
  // ============================================================
  const vocab1 = [
    'greet_hello', 'greet_hi', 'greet_morning', 'greet_day',
    'greet_evening', 'greet_night', 'greet_bye', 'greet_seeyou',
    'greet_welcome', 'greet_pleasure', 'greet_meet', 'greet_name',
    'greet_friend', 'greet_mr', 'greet_mrs', 'greet_thanks',
    'greet_please', 'greet_sorry', 'greet_yes', 'greet_no',
    'greet_how', 'greet_good', 'greet_fine', 'greet_bad',
    'greet_okay'
  ];

  for (const key of vocab1) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 2: DAILY LIFE
  // ============================================================
  const vocab2 = [
    // Home
    'home_house', 'home_apartment', 'home_room', 'home_kitchen',
    'home_bedroom', 'home_living', 'home_bathroom', 'home_balcony',
    'home_hallway', 'home_door', 'home_window', 'home_floor',
    'home_ceiling', 'home_wall', 'home_roof', 'home_stair',
    'home_yard', 'home_garden', 'home_level', 'home_entrance',
    'home_key', 'home_lock', 'home_cozy', 'home_clean', 'home_bright',
    // Rooms
    'room_toilet', 'room_study', 'room_storage', 'room_basement',
    'room_attic', 'room_dining', 'room_nursery', 'room_guest',
    'room_closet', 'room_shelf', 'room_corner', 'room_center',
    'room_exit', 'room_big', 'room_small', 'room_wide',
    'room_narrow', 'room_high', 'room_low', 'room_warm',
    // Furniture
    'fur_chair', 'fur_table', 'fur_bed', 'fur_sofa',
    'fur_armchair', 'fur_wardrobe', 'fur_desk', 'fur_bookcase',
    'fur_mirror', 'fur_lamp', 'fur_carpet', 'fur_curtain',
    'fur_pillow', 'fur_blanket', 'fur_sheet', 'fur_fridge',
    'fur_stove', 'fur_washing', 'fur_tv', 'fur_computer',
    'fur_clock', 'fur_picture', 'fur_vase', 'fur_candle', 'fur_book',
    // Food
    'food_bread', 'food_cheese', 'food_butter', 'food_egg',
    'food_milk', 'food_yogurt', 'food_meat', 'food_chicken',
    'food_fish', 'food_rice', 'food_potato', 'food_tomato',
    'food_cucumber', 'food_onion', 'food_garlic', 'food_apple',
    'food_banana', 'food_orange', 'food_grape', 'food_watermelon',
    'food_salt', 'food_pepper', 'food_sugar', 'food_honey', 'food_soup',
    // Drinks
    'drink_water', 'drink_tea', 'drink_coffee', 'drink_juice',
    'drink_beer', 'drink_wine', 'drink_cognac', 'drink_vodka',
    'drink_lemonade', 'drink_cola', 'drink_milkshake', 'drink_hot',
    'drink_cold', 'drink_sweet', 'drink_bitter', 'drink_sour',
    'drink_glass', 'drink_mug', 'drink_bottle', 'drink_can',
    'drink_drink_verb', 'drink_pour', 'drink_order', 'drink_thirsty', 'drink_cheers',
    // Restaurant
    'rest_restaurant', 'rest_cafe', 'rest_waiter', 'rest_menu',
    'rest_order', 'rest_bill', 'rest_tip', 'rest_table',
    'rest_reservation', 'rest_appetizer', 'rest_salad', 'rest_main',
    'rest_dessert', 'rest_icecream', 'rest_cake', 'rest_fork',
    'rest_spoon', 'rest_knife', 'rest_plate', 'rest_napkin',
    'rest_delicious', 'rest_fresh', 'rest_order_verb', 'rest_recommend', 'rest_card',
    // Shopping
    'shop_shop', 'shop_market', 'shop_price', 'shop_discount',
    'shop_sale', 'shop_buy', 'shop_sell', 'shop_pay',
    'shop_cash', 'shop_card', 'shop_receipt', 'shop_exchange',
    'shop_return', 'shop_customer', 'shop_seller', 'shop_bag',
    'shop_cheap', 'shop_expensive', 'shop_quality', 'shop_size',
    'shop_color', 'shop_large', 'shop_small_size', 'shop_new', 'shop_old',
    // Clothing
    'cloth_shirt', 'cloth_trousers', 'cloth_dress', 'cloth_skirt',
    'cloth_jacket', 'cloth_coat', 'cloth_socks', 'cloth_shoes',
    'cloth_hat', 'cloth_scarf', 'cloth_gloves', 'cloth_belt',
    'cloth_tie', 'cloth_handbag', 'cloth_umbrella', 'cloth_glasses',
    'cloth_watch', 'cloth_ring', 'cloth_necklace', 'cloth_wear',
    'cloth_takeoff', 'cloth_change', 'cloth_tryon', 'cloth_size', 'cloth_color',
    // Weather
    'weather_sun', 'weather_cloud', 'weather_rain', 'weather_snow',
    'weather_wind', 'weather_storm', 'weather_thunder', 'weather_lightning',
    'weather_fog', 'weather_dew', 'weather_warm', 'weather_hot',
    'weather_cold', 'weather_freezing', 'weather_cool', 'weather_sunny',
    'weather_cloudy', 'weather_rainy', 'weather_snowy', 'weather_windy',
    'weather_spring', 'weather_summer', 'weather_autumn', 'weather_winter', 'weather_degree',
    // Time
    'time_hour', 'time_minute', 'time_second', 'time_day',
    'time_week', 'time_month', 'time_year', 'time_today',
    'time_tomorrow', 'time_yesterday', 'time_now', 'time_later',
    'time_morning', 'time_noon', 'time_evening', 'time_night',
    'time_monday', 'time_tuesday', 'time_wednesday', 'time_thursday',
    'time_friday', 'time_saturday', 'time_sunday', 'time_clock', 'time_calendar',
  ];

  for (const key of vocab2) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 3: TRAVEL
  // ============================================================
  const vocab3 = [
    // Airport
    'air_airport', 'air_plane', 'air_ticket', 'air_passport',
    'air_visa', 'air_luggage', 'air_flight', 'air_delay',
    'air_passenger', 'air_crew', 'air_checkin', 'air_passport_control',
    'air_customs', 'air_security', 'air_terminal', 'air_gate',
    'air_boarding', 'air_landing', 'air_takeoff', 'air_control',
    'air_postponement', 'air_cancellation', 'air_inspection', 'air_tray', 'air_bag',
    // Taxi
    'taxi_taxi', 'taxi_driver', 'taxi_address', 'taxi_meter',
    'taxi_price', 'taxi_stop', 'taxi_street', 'taxi_avenue',
    'taxi_intersection', 'taxi_light', 'taxi_right', 'taxi_left',
    'taxi_straight', 'taxi_back', 'taxi_fast', 'taxi_slow',
    'taxi_stop_verb', 'taxi_go', 'taxi_turn', 'taxi_bridge',
    'taxi_kilometer', 'taxi_map', 'taxi_tourist', 'taxi_next_to', 'taxi_near',
    // Hotel
    'hotel_hotel', 'hotel_room', 'hotel_reception', 'hotel_key',
    'hotel_floor', 'hotel_elevator', 'hotel_stairs', 'hotel_bed',
    'hotel_bathroom', 'hotel_towel', 'hotel_soap', 'hotel_shampoo',
    'hotel_breakfast', 'hotel_lunch', 'hotel_dinner', 'hotel_wifi',
    'hotel_ac', 'hotel_tv', 'hotel_window', 'hotel_quiet',
    'hotel_noisy', 'hotel_clean', 'hotel_dirty', 'hotel_reservation', 'hotel_bill',
    // Directions
    'dir_right', 'dir_left', 'dir_straight', 'dir_back',
    'dir_north', 'dir_south', 'dir_east', 'dir_west',
    'dir_next_to', 'dir_in_front', 'dir_behind', 'dir_in',
    'dir_on', 'dir_under', 'dir_near', 'dir_far',
    'dir_crossroads', 'dir_corner', 'dir_avenue', 'dir_street',
    'dir_map', 'dir_compass', 'dir_come', 'dir_go', 'dir_cross',
    // Train
    'train_train', 'train_station', 'train_platform', 'train_ticket',
    'train_carriage', 'train_seat', 'train_route', 'train_departure',
    'train_arrival', 'train_direct', 'train_transfer', 'train_night',
    'train_day', 'train_slow', 'train_fast', 'train_metro',
    'train_electric', 'train_conductor', 'train_passenger', 'train_door',
    'train_window', 'train_open', 'train_close', 'train_sit', 'train_get_off',
    // Bus
    'bus_bus', 'bus_stop', 'bus_route', 'bus_number',
    'bus_driver', 'bus_ticket', 'bus_pass', 'bus_stop_verb',
    'bus_next', 'bus_previous', 'bus_crowded', 'bus_empty',
    'bus_sit', 'bus_stand', 'bus_get_off', 'bus_get_on',
    'bus_center', 'bus_suburb', 'bus_transport', 'bus_public',
    'bus_minibus', 'bus_trolleybus', 'bus_metro', 'bus_card', 'bus_transfer',
    // Tourism
    'tour_tourist', 'tour_tourism', 'tour_museum', 'tour_church',
    'tour_monastery', 'tour_fortress', 'tour_sculpture', 'tour_monument',
    'tour_park', 'tour_square', 'tour_tour', 'tour_guide',
    'tour_ticket', 'tour_photo', 'tour_souvenir', 'tour_history',
    'tour_culture', 'tour_art', 'tour_ancient', 'tour_beautiful',
    'tour_impressive', 'tour_famous', 'tour_visit', 'tour_see', 'tour_photograph',
    // Emergency
    'emer_emergency', 'emer_help', 'emer_police', 'emer_ambulance',
    'emer_fire', 'emer_hospital', 'emer_doctor', 'emer_pharmacy',
    'emer_accident', 'emer_fire_emerg', 'emer_thief', 'emer_lost',
    'emer_injured', 'emer_sick', 'emer_pain', 'emer_blood',
    'emer_medicine', 'emer_phone', 'emer_call', 'emer_help_verb',
    'emer_save', 'emer_danger', 'emer_safe', 'emer_quickly', 'emer_problem',
  ];

  for (const key of vocab3) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 4: EDUCATION & WORK
  // ============================================================
  const vocab4 = [
    // School
    'sch_school', 'sch_pupil', 'sch_teacher', 'sch_lesson',
    'sch_classroom', 'sch_homework', 'sch_exam', 'sch_grade',
    'sch_book', 'sch_notebook', 'sch_pen', 'sch_pencil',
    'sch_blackboard', 'sch_chalk', 'sch_bag', 'sch_break',
    'sch_math', 'sch_history', 'sch_geography', 'sch_physics',
    'sch_chemistry', 'sch_language', 'sch_literature', 'sch_sport', 'sch_art',
    // University
    'uni_university', 'uni_student', 'uni_lecturer', 'uni_professor',
    'uni_faculty', 'uni_major', 'uni_course', 'uni_semester',
    'uni_lecture', 'uni_seminar', 'uni_exam', 'uni_credit',
    'uni_diploma', 'uni_science', 'uni_research', 'uni_library',
    'uni_lab', 'uni_dorm', 'uni_scholarship', 'uni_masters',
    'uni_bachelors', 'uni_phd', 'uni_conference', 'uni_article', 'uni_thesis',
    // Office
    'off_office', 'off_employee', 'off_colleague', 'off_manager',
    'off_director', 'off_deputy', 'off_work', 'off_contract',
    'off_salary', 'off_vacation', 'off_meeting', 'off_report',
    'off_project', 'off_task', 'off_deadline', 'off_call',
    'off_email', 'off_computer', 'off_printer', 'off_file',
    'off_document', 'off_signature', 'off_stamp', 'off_client', 'off_company',
    // Professions
    'pro_chef', 'pro_waiter', 'pro_driver', 'pro_police',
    'pro_secretary', 'pro_manager', 'pro_director', 'pro_scientist',
    'pro_nurse', 'pro_architect', 'pro_photographer', 'pro_designer',
    'pro_accountant', 'pro_worker', 'pro_farmer', 'pro_soldier',
    'pro_priest',
    // Meetings
    'mtg_meeting', 'mtg_discussion', 'mtg_decision', 'mtg_agenda',
    'mtg_session', 'mtg_participant', 'mtg_chair', 'mtg_secretary',
    'mtg_report', 'mtg_presentation', 'mtg_question', 'mtg_answer',
    'mtg_opinion', 'mtg_proposal', 'mtg_vote', 'mtg_agreement',
    'mtg_against', 'mtg_for', 'mtg_abstain', 'mtg_minutes',
    'mtg_official', 'mtg_informal', 'mtg_remote', 'mtg_video', 'mtg_break',
    // Technology
    'tech_computer', 'tech_laptop', 'tech_phone', 'tech_tablet',
    'tech_screen', 'tech_keyboard', 'tech_mouse', 'tech_file',
    'tech_folder', 'tech_program', 'tech_app', 'tech_website',
    'tech_page', 'tech_link', 'tech_password', 'tech_username',
    'tech_account', 'tech_internet', 'tech_wifi', 'tech_network',
    'tech_data', 'tech_backup', 'tech_update', 'tech_error', 'tech_virus',
  ];

  for (const key of vocab4) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 5: ADVANCED COMMUNICATION
  // ============================================================
  const vocab5 = [
    // Opinions
    'op_opinion', 'op_viewpoint', 'op_agree', 'op_disagree',
    'op_discussion', 'op_argument', 'op_proof', 'op_fact',
    'op_think', 'op_believe', 'op_consider', 'op_impression',
    'op_conviction', 'op_doubt', 'op_logical', 'op_contradictory',
    'op_strong', 'op_weak', 'op_reasonable', 'op_groundless',
    'op_doubt_verb', 'op_justify', 'op_side', 'op_opponent', 'op_supporter',
    // Emotions
    'em_happy', 'em_sad', 'em_angry', 'em_surprised',
    'em_scared', 'em_tired', 'em_calm', 'em_anxious',
    'em_excited', 'em_bored', 'em_proud', 'em_shy',
    'em_in_love', 'em_hateful', 'em_joyful', 'em_disappointed',
    'em_confused', 'em_patient', 'em_impatient', 'em_depressed',
    'em_feeling', 'em_mood', 'em_tear', 'em_laughter', 'em_smile',
    // Storytelling
    'st_story', 'st_fairytale', 'st_hero', 'st_heroine',
    'st_villain', 'st_beginning', 'st_middle', 'st_end',
    'st_character', 'st_plot', 'st_event', 'st_place',
    'st_time', 'st_adventure', 'st_secret', 'st_miracle',
    'st_happen', 'st_tell', 'st_remember', 'st_forget',
    'st_long_ago', 'st_suddenly', 'st_finally', 'st_then', 'st_meanwhile',
    // Problem Solving
    'ps_problem', 'ps_solution', 'ps_cause', 'ps_consequence',
    'ps_analyze', 'ps_decide', 'ps_think', 'ps_try',
    'ps_succeed', 'ps_fail', 'ps_step', 'ps_option',
    'ps_choice', 'ps_decision', 'ps_difficulty', 'ps_success',
    'ps_failure', 'ps_shortcut', 'ps_best', 'ps_fast',
    'ps_creative', 'ps_patience', 'ps_work', 'ps_plan', 'ps_calmness',
    // Negotiation
    'neg_negotiation', 'neg_agreement', 'neg_terms', 'neg_price',
    'neg_discount', 'neg_offer', 'neg_counter', 'neg_agreed',
    'neg_reject', 'neg_accept', 'neg_discuss', 'neg_agree_verb',
    'neg_concede', 'neg_demand', 'neg_compromise', 'neg_benefit',
    'neg_loss', 'neg_risk', 'neg_opportunity', 'neg_condition',
    'neg_sign', 'neg_authority', 'neg_side', 'neg_client', 'neg_supplier',
    // Culture
    'cul_culture', 'cul_tradition', 'cul_custom', 'cul_holiday',
    'cul_religion', 'cul_art', 'cul_music', 'cul_dance',
    'cul_cuisine', 'cul_language', 'cul_literature', 'cul_poetry',
    'cul_history', 'cul_people', 'cul_nation', 'cul_homeland',
    'cul_roots', 'cul_identity', 'cul_values', 'cul_respect',
    'cul_difference', 'cul_diversity', 'cul_tolerance', 'cul_shared', 'cul_pride',
  ];

  for (const key of vocab5) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 6: HOBBIES
  // ============================================================
  const vocab6 = [
    'hob_hobby', 'hob_free_time', 'hob_interest', 'hob_love',
    'hob_enjoy', 'hob_practice', 'hob_skill', 'hob_training',
    'hob_club', 'hob_instructor', 'hob_friends', 'hob_spend_time',
    'hob_relaxation', 'hob_health', 'hob_equipment', 'hob_cost',
    'hob_schedule', 'hob_competition', 'hob_amateur', 'hob_professional',
    'hob_energy', 'hob_success', 'hob_learn', 'hob_improve', 'hob_relax',
  ];

  for (const key of vocab6) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 7: TECHNOLOGY
  // ============================================================
  const vocab7 = [
    'tec_computer', 'tec_laptop', 'tec_phone', 'tec_tablet',
    'tec_screen', 'tec_keyboard', 'tec_mouse', 'tec_internet',
    'tec_wifi', 'tec_network', 'tec_app', 'tec_website',
    'tec_password', 'tec_account', 'tec_data', 'tec_cloud',
    'tec_security', 'tec_virus', 'tec_update', 'tec_error',
    'tec_programming', 'tec_ai', 'tec_virtual', 'tec_smart', 'tec_fast',
  ];

  for (const key of vocab7) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 8: ENVIRONMENT
  // ============================================================
  const vocab8 = [
    'env_nature', 'env_environment', 'env_climate', 'env_temperature',
    'env_pollution', 'env_waste', 'env_plastic', 'env_recycling',
    'env_deforestation', 'env_animals', 'env_endangered', 'env_reserve',
    'env_ecosystem', 'env_sustainability', 'env_solar', 'env_wind',
    'env_carbon', 'env_green', 'env_renewable', 'env_harmful',
    'env_protect', 'env_save', 'env_reduce', 'env_reuse', 'env_plant',
  ];

  for (const key of vocab8) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 9: BUSINESS
  // ============================================================
  const vocab9 = [
    'biz_business', 'biz_company', 'biz_client', 'biz_market',
    'biz_profit', 'biz_expense', 'biz_loan', 'biz_deposit',
    'biz_account', 'biz_tax', 'biz_salary', 'biz_bonus',
    'biz_contract', 'biz_stamp', 'biz_signature', 'biz_meeting',
    'biz_presentation', 'biz_sales', 'biz_advertising', 'biz_product',
    'biz_service', 'biz_manager', 'biz_director', 'biz_shareholder', 'biz_investment',
  ];

  for (const key of vocab9) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // WORLD 10: ART
  // ============================================================
  const vocab10 = [
    'art_art', 'art_artist', 'art_work', 'art_exhibition',
    'art_museum', 'art_gallery', 'art_beauty', 'art_inspiration',
    'art_create', 'art_express', 'art_emotion', 'art_idea',
    'art_style', 'art_classical', 'art_modern', 'art_novel',
    'art_poem', 'art_actor', 'art_film', 'art_director',
    'art_role', 'art_stage', 'art_audience', 'art_critic', 'art_masterpiece',
  ];

  for (const key of vocab10) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // NUMBERS
  // ============================================================
  const numbers = [
    'num_1', 'num_2', 'num_3', 'num_4', 'num_5',
    'num_6', 'num_7', 'num_8', 'num_9', 'num_10',
    'age_twenty', 'age_thirty', 'age_forty', 'age_fifty',
    'age_sixty', 'age_seventy', 'age_eighty', 'age_ninety',
    'age_hundred', 'age_year', 'age_years_old', 'age_birthday',
    'age_young', 'age_old', 'age_small',
  ];

  for (const key of numbers) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // FAMILY
  // ============================================================
  const family = [
    'fam_mother', 'fam_father', 'fam_sister', 'fam_brother',
    'fam_son', 'fam_daughter', 'fam_grandma', 'fam_grandpa',
    'fam_uncle_p', 'fam_uncle_m', 'fam_aunt_p', 'fam_aunt_m',
    'fam_cousin_m', 'fam_cousin_f', 'fam_husband', 'fam_wife',
    'fam_child', 'fam_children', 'fam_family', 'fam_relative',
    'fam_younger', 'fam_older', 'fam_only', 'fam_twin', 'fam_married',
  ];

  for (const key of family) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // FRIENDS
  // ============================================================
  const friends = [
    'fr_friend_m', 'fr_friend_f', 'fr_best', 'fr_close',
    'fr_old', 'fr_new', 'fr_meet', 'fr_call',
    'fr_write', 'fr_communicate', 'fr_talk', 'fr_play',
    'fr_walk', 'fr_laugh', 'fr_have_fun', 'fr_trust',
    'fr_support', 'fr_kind', 'fr_loyal', 'fr_interesting',
    'fr_funny', 'fr_calm', 'fr_noisy', 'fr_friendship', 'fr_meeting',
  ];

  for (const key of friends) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  // ============================================================
  // OCCUPATIONS
  // ============================================================
  const occupations = [
    'oc_doctor', 'oc_teacher', 'oc_engineer', 'oc_programmer',
    'oc_journalist', 'oc_lawyer', 'oc_artist', 'oc_musician',
    'oc_cook', 'oc_waiter', 'oc_driver', 'oc_police',
    'oc_soldier', 'oc_secretary', 'oc_manager', 'oc_director',
    'oc_scientist', 'oc_nurse', 'oc_architect', 'oc_photographer',
    'oc_work', 'oc_profession', 'oc_job', 'oc_work_verb', 'oc_office',
  ];

  for (const key of occupations) {
    const num = String(counter).padStart(6, '0');
    mappings.push({ key, value: num });
    counter++;
  }

  console.log(`✅ Generated ${mappings.length} vocabulary mappings`);
  return mappings;
}

// ============================================================
// GENERATE EXERCISE MAPPINGS (w*_l*_e* → audio ID)
// ============================================================

function generateExerciseMappings(): Mapping[] {
  const mappings: Mapping[] = [];
  let counter = 1;

  // ============================================================
  // WORLD 1: LESSONS 1-10 (w1_l1 to w1_l10)
  // ============================================================
  // w1_l1 uses greet_* keys
  const greetKeys = [
    'greet_hello', 'greet_hi', 'greet_morning', 'greet_day',
    'greet_evening', 'greet_night', 'greet_bye', 'greet_seeyou',
    'greet_welcome', 'greet_pleasure', 'greet_meet', 'greet_name',
    'greet_friend', 'greet_mr', 'greet_mrs', 'greet_thanks', 'greet_please'
  ];

  for (let i = 0; i < greetKeys.length; i++) {
    mappings.push({ key: `w1_l1_e${i}`, value: greetKeys[i] });
    counter++;
  }

  // w1_l2 - w1_l10 use numeric audio IDs
  for (let lesson = 2; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w1_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 2: LESSONS 1-10 (w2_l1 to w2_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w2_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 3: LESSONS 1-10 (w3_l1 to w3_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w3_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 4: LESSONS 1-10 (w4_l1 to w4_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w4_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 5: LESSONS 1-10 (w5_l1 to w5_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w5_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 6: LESSONS 1-10 (w6_l1 to w6_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w6_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 7: LESSONS 1-10 (w7_l1 to w7_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w7_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 8: LESSONS 1-10 (w8_l1 to w8_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w8_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 9: LESSONS 1-10 (w9_l1 to w9_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w9_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  // ============================================================
  // WORLD 10: LESSONS 1-10 (w10_l1 to w10_l10)
  // ============================================================
  for (let lesson = 1; lesson <= 10; lesson++) {
    for (let exercise = 0; exercise < 17; exercise++) {
      const num = String(counter).padStart(6, '0');
      mappings.push({ key: `w10_l${lesson}_e${exercise}`, value: num });
      counter++;
    }
  }

  console.log(`✅ Generated ${mappings.length} exercise mappings`);
  return mappings;
}

// ============================================================
// WRITE TO FILE
// ============================================================

function writeAudioMapping(): void {
  const exerciseMappings = generateExerciseMappings();
  const vocabMappings = generateAllVocabMappings();

  // Merge mappings (exercise mappings take priority)
  const allMappings: Record<string, string> = {};
  
  // First add vocabulary mappings
  for (const m of vocabMappings) {
    allMappings[m.key] = m.value;
  }
  
  // Then add exercise mappings (override if conflict)
  for (const m of exerciseMappings) {
    allMappings[m.key] = m.value;
  }

  // Convert to sorted array
  const sortedKeys = Object.keys(allMappings).sort();
  const sortedMappings: Record<string, string> = {};
  for (const key of sortedKeys) {
    sortedMappings[key] = allMappings[key];
  }

  // Generate file content
  const content = `// src/lib/content/audio-mapping.ts
// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Generated: ${new Date().toISOString()}
// Total entries: ${Object.keys(sortedMappings).length}

export const EXERCISE_TO_AUDIO: Record<string, string> = {
${Object.entries(sortedMappings).map(([key, value]) => `  "${key}": "${value}",`).join('\n')}
};

// Reverse mapping for numeric IDs
export const NUM_TO_EXERCISE: Record<string, string> = {};
for (const [key, value] of Object.entries(EXERCISE_TO_AUDIO)) {
  NUM_TO_EXERCISE[value] = key;
}

// Helper to check if an exercise has audio
export function hasAudio(exerciseId: string): boolean {
  return !!EXERCISE_TO_AUDIO[exerciseId];
}

// Helper to get audio path
export function getAudioPath(
  exerciseId: string,
  language: 'hy' | 'en' | 'ru',
  gender: 'male' | 'female' = 'female'
): string | null {
  const audioId = EXERCISE_TO_AUDIO[exerciseId];
  if (!audioId) return null;
  
  const basePaths: Record<string, string> = {
    hy: '/audio/offline/hy_Ani/',
    en: '/audio/offline/en_female/',
    ru: '/audio/offline/ru_female/',
  };
  
  const basePath = basePaths[language] || basePaths.hy;
  return \`\${basePath}\${audioId}.mp3\`;
}

// Stats
export const STATS = {
  totalEntries: ${Object.keys(sortedMappings).length},
  generatedAt: '${new Date().toISOString()}',
};
`;

  // Write file
  const outputPath = path.join(process.cwd(), OUTPUT_FILE);
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Written to: ${outputPath}`);
  console.log(`📊 Total entries: ${Object.keys(sortedMappings).length}`);
}

// ============================================================
// RUN
// ============================================================

writeAudioMapping();