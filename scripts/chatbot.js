document.addEventListener('DOMContentLoaded', function() {
  // ==================== ELEMENTOS DEL DOM ====================
  const elements = {
    chatbotToggle: document.querySelector('.chatbot-toggle'),
    chatbotWindow: document.querySelector('.chatbot-window'),
    closeBtn: document.querySelector('.close-btn'),
    chatbotMessages: document.querySelector('.chatbot-messages'),
    chatbotForm: document.getElementById('chatbot-form'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.querySelector('.send-btn'), // Referencia al botón de enviar
    notificationBadge: document.querySelector('.notification-badge'),
    // El botón de opciones (los 3 puntos) y su menú han sido eliminados del HTML
    // optionsMenuToggle: document.querySelector('.accessibility-options .options-menu-toggle'), 
    // optionsMenu: document.querySelector('.options-menu'),
    textSizeBtn: document.querySelector('.text-size-btn'),
    highContrastBtn: document.querySelector('.high-contrast-btn'),
    clearBtn: document.querySelector('.clear-btn'),
    restartBtn: document.querySelector('.restart-btn'), // Nuevo botón de reiniciar
    voiceBtn: document.getElementById('voice-btn'), // Botón de voz con ID
    foodCalculatorModal: document.getElementById('food-calculator-modal'),
    emergencyModal: document.getElementById('emergency-modal'),
    closeModalBtns: document.querySelectorAll('.close-modal'),
    foodCalculatorForm: document.getElementById('food-calculator-form'),
    foodResult: document.getElementById('food-result'),
    savePlanBtn: document.getElementById('save-plan'), // Nuevo: Botón de guardar plan
    // Botones del modal de emergencia
    callVetBtn: document.getElementById('call-vet'),
    findClinicBtn: document.getElementById('find-clinic'),
    petAmbulanceBtn: document.getElementById('pet-ambulance'),
    quickActionsContainer: document.querySelector('.chatbot-input .quick-actions') // Referencia al contenedor de quick-actions
  };

  // ==================== ESTADO DEL CHATBOT ====================
  const state = {
    isOpen: false,
    unreadMessages: 0,
    userName: localStorage.getItem('pawfriend_userName') || null,
    favoritePets: JSON.parse(localStorage.getItem('pawfriend_favorites')) || [],
    conversationHistory: JSON.parse(localStorage.getItem('pawfriend_chatHistory')) || [],
    currentContext: null, // Contexto actual de la conversación
    recognition: null, // Objeto SpeechRecognition
    isListening: false, // Estado del reconocimiento de voz
    notificationInterval: null, // Para notificaciones simuladas
    isHighContrast: localStorage.getItem('highContrast') === 'true', // Cargar estado de alto contraste
    textSize: localStorage.getItem('textSize') || 'normal' // Cargar estado de tamaño de texto
  };

  // ==================== BASE DE CONOCIMIENTOS ====================
  // Respuestas y flujos de conversación del chatbot
  // La información de esta base de conocimientos está alineada con los archivos HTML proporcionados.
  const knowledgeBase = {
    // Mapeo de texto de botón a una clave de acción interna para robustez
    quickActionMap: {
        "Adoptar una mascota": "adopt",
        "Donar al refugio": "donate",
        "Información sobre cuidados": "info",
        "Eventos": "events",
        "Contacto": "contact",
        "Mi perfil": "profile",
        "Perro": "dog_type", // Usar un sufijo para evitar conflicto con data-action 'dog' en handlePetAction
        "Gato": "cat_type",
        "Conejo": "rabbit_type",
        "Ave": "bird_type",
        "Otro": "other_type",
        "Volver al menú principal": "main_menu",
        "Pequeño": "size_small",
        "Mediano": "size_medium",
        "Grande": "size_large",
        "No tengo preferencia": "size_no_preference",
        "Ver todos los perros": "view_all_dogs",
        "Macho": "gender_male",
        "Hembra": "gender:female", // Cambiado a ':' para evitar conflicto con 'gender_female'
        "Juguetón": "trait_playful",
        "Tranquilo": "trait_calm",
        "Cariñoso": "trait_affectionate",
        "Independiente": "trait_independent",
        "Ver todos los gatos": "view_all_cats",
        "Sí, tengo experiencia": "exp_yes",
        "No, sería mi primer conejo": "exp_no",
        "Periquitos": "breed_parakeet",
        "Canarios": "breed_canary",
        "Loros": "breed_parrot",
        "Otras aves": "breed_other_birds",
        "Hamsters": "type_hamster",
        "Tortugas": "type_turtle",
        "Peces": "type_fish",
        "Reptiles": "type_reptile",
        "Otras": "type_other_exotic",
        "Cuidados básicos": "care_basic",
        "Alimentación": "care_feeding",
        "Entrenamiento": "care_training",
        "Salud": "care_health",
        "Donación económica": "donate_money",
        "Donación de suministros": "donate_supplies",
        "Hacerme voluntario": "become_volunteer",
        "Apadrinar una mascota": "sponsor_pet",
        "Ver próximos eventos": "events_upcoming",
        "Eventos pasados": "events_past",
        "Agendar recordatorio": "events_schedule_reminder",
        "Enviar un mensaje": "contact_message",
        "Llamar por teléfono": "contact_call",
        "Visitar el refugio": "contact_visit",
        "Ver mis adopciones": "profile_adoptions",
        "Ver mis favoritos": "profile_favorites",
        "Configuración de cuenta": "profile_settings",
        "Cerrar sesión": "profile_logout",
        "Nueva consulta": "new_query",
        "Cerrar chat": "close_chat_window",
        "Sí, avísame": "notify_new_pets",
        "No, gracias": "no_notify_new_pets",
        "Solicitar información": "request_pet_info",
        "Agendar visita": "schedule_pet_visit",
        "Ver más opciones": "view_more_pet_options",
        "Compartir ubicación": "share_location",
        "Buscar por ciudad": "search_by_city",
        "Cita veterinaria": "reminder_vet_appointment",
        "Medicación": "reminder_medication",
        "Evento": "reminder_event",
        "Otro": "reminder_other",
        // Acciones para botones inline/acceso directo
        "emergency": "emergency_modal",
        "food_calculator": "food_calculator_modal",
        "toggle_high_contrast": "toggle_high_contrast",
        "toggle_text_size": "toggle_text_size",
        "clear_conversation": "clear_conversation",
        "restart_chatbot": "restart_chatbot"
        // "options_menu_toggle": "toggle_options_menu" // Eliminado
    },
    greeting: {
      message: state.userName ?
        `¡Hola de nuevo, ${state.userName}! 🐾 ¿Cómo puedo ayudarte hoy?` :
        "¡Hola! Soy PawFriend, tu asistente virtual de Rescue Paws. ¿Cómo te llamas?",
      options: ["Adoptar una mascota", "Donar al refugio", "Información sobre cuidados", "Eventos", "Contacto", "Mi perfil"],
      context: state.userName ? null : "get_name"
    },
    get_name: {
      message: "Por favor, dime tu nombre para que pueda saludarte mejor.",
      options: [],
      handler: (name) => {
        state.userName = name.trim();
        localStorage.setItem('pawfriend_userName', state.userName);
        state.currentContext = null;
        // Mostrar opciones en la conversación después de obtener el nombre
        addMessage(`¡Encantado de conocerte, ${state.userName}! 🐾 ¿En qué puedo ayudarte hoy?`, 'bot', false, knowledgeBase.greeting.options);
      }
    },
    adoption: {
      message: "🐶 ¡Excelente decisión! Tenemos muchos amigos peludos esperando un hogar. ¿Qué tipo de mascota prefieres?",
      options: ["Perro", "Gato", "Conejo", "Ave", "Otro", "Volver al menú principal"],
      context: "pet_type_selection"
    },
    pet_type_selection: { // Nuevo contexto para la selección de tipo de mascota
        responses: {
            "dog_type": {
                message: "🐕 ¡Los perros son increíbles compañeros! ¿Qué tamaño prefieres?",
                options: ["Pequeño", "Mediano", "Grande", "No tengo preferencia", "Ver todos los perros", "Volver al menú principal"],
                context: "dog_size_selection"
            },
            "cat_type": {
                message: "🐈 ¡Los gatos son mascotas maravillosas! ¿Buscas algún rasgo específico?",
                options: ["Juguetón", "Tranquilo", "Cariñoso", "Independiente", "No tengo preferencia", "Ver todos los gatos", "Volver al menú principal"],
                context: "cat_trait_selection"
            },
            "rabbit_type": {
                message: "🐇 ¡Los conejos son adorables! ¿Tienes experiencia con ellos?",
                options: ["Sí, tengo experiencia", "No, sería mi primer conejo", "Volver al menú principal"],
                context: "rabbit_experience_selection"
            },
            "bird_type": {
                message: "🦜 ¡Las aves son fascinantes! ¿Qué tipo de ave te interesa?",
                options: ["Periquitos", "Canarios", "Loros", "Otras aves", "Volver al menú principal"],
                context: "bird_type_selection"
            },
            "other_type": {
                message: "🦎 ¡Tenemos varias opciones! ¿Qué tipo de mascota te interesa?",
                options: ["Hamsters", "Tortugas", "Peces", "Reptiles", "Otras", "Volver al menú principal"],
                context: "other_pet_type_selection"
            }
        },
        default: "Por favor selecciona una de las opciones: Perro, Gato, Conejo, Ave u Otro. También puedes decir 'Volver al menú principal'."
    },
    dog_size_selection: {
      responses: {
        "size_small": { message: "🐕‍🦺 ¡Perfecto! Tenemos varios perritos pequeños buscando hogar. ¿Prefieres macho o hembra? O puedes <a href='adopcion.html?type=dog&size=small' target='_blank'>verlos aquí</a>.", context: "dog_gender_selection" },
        "size_medium": { message: "🐕 ¡Genial! Los perros medianos son muy versátiles. ¿Prefieres macho o hembra? O puedes <a href='adopcion.html?type=dog&size=medium' target='_blank'>verlos aquí</a>.", context: "dog_gender_selection" },
        "size_large": { message: "🦮 ¡Excelente! Los perros grandes son muy leales. ¿Prefieres macho o hembra? O puedes <a href='adopcion.html?type=dog&size=large' target='_blank'>verlos aquí</a>.", context: "dog_gender_selection" },
        "size_no_preference": { message: "🐾 ¡Entendido! Puedes <a href='adopcion.html?type=dog' target='_blank'>ver todos los perros disponibles aquí</a>.", context: null },
        "view_all_dogs": { message: "Claro, puedes <a href='adopcion.html?type=dog' target='_blank'>ver todos los perros disponibles aquí</a>.", context: null }
      },
      options: ["Macho", "Hembra", "No tengo preferencia", "Volver al menú principal"], // Opciones para mostrar si el usuario escribe
      default: "Por favor, selecciona una opción de tamaño o di 'No tengo preferencia' o 'Volver al menú principal'."
    },
    dog_gender_selection: {
        responses: {
            "gender_male": { message: "Entendido, buscaré perros machos. Puedes <a href='adopcion.html?type=dog&gender=male' target='_blank'>verlos aquí</a>.", context: null },
            "gender:female": { message: "Entendido, buscaré perras hembras. Puedes <a href='adopcion.html?type=dog&gender=female' target='_blank'>verlas aquí</a>.", context: null },
            "size_no_preference": { message: "Entendido, buscaré perros de cualquier género. Puedes <a href='adopcion.html?type=dog' target='_blank'>verlos aquí</a>.", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona una opción de género o di 'No tengo preferencia'."
    },
    cat_trait_selection: {
        responses: {
            "trait_playful": { message: "¡A los gatos juguetones les encanta la diversión! Puedes <a href='adopcion.html?type=cat&trait=playful' target='_blank'>ver gatitos juguetones aquí</a>.", context: null },
            "trait_calm": { message: "Los gatos tranquilos son perfectos para un ambiente relajado. Puedes <a href='adopcion.html?type=cat&trait=calm' target='_blank'>ver gatitos tranquilos aquí</a>.", context: null },
            "trait_affectionate": { message: "¡Un gato cariñoso te llenará de mimos! Puedes <a href='adopcion.html?type=cat&trait=affectionate' target='_blank'>ver gatitos cariñosos aquí</a>.", context: null },
            "trait_independent": { message: "Los gatos independientes son ideales si buscas una compañía más discreta. Puedes <a href='adopcion.html?type=cat&trait=independent' target='_blank'>ver gatitos independientes aquí</a>.", context: null },
            "size_no_preference": { message: "Entendido, puedes <a href='adopcion.html?type=cat' target='_blank'>ver todos los gatos disponibles aquí</a>.", context: null },
            "view_all_cats": { message: "Claro, puedes <a href='adopcion.html?type=cat' target='_blank'>ver todos los gatos disponibles aquí</a>.", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona un rasgo o di 'No tengo preferencia'."
    },
    rabbit_experience_selection: {
        responses: {
            "exp_yes": { message: "¡Genial! Los conejos son mascotas que requieren cuidados específicos. Puedes <a href='adopcion.html?type=rabbit' target='_blank'>ver conejos disponibles aquí</a>.", context: null },
            "exp_no": { message: "Los conejos son adorables pero necesitan un buen aprendizaje. Te recomiendo investigar sobre sus cuidados antes de adoptar. Puedes <a href='adopcion.html?type=rabbit' target='_blank'>ver conejos disponibles aquí</a>.", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, responde si tienes experiencia o no."
    },
    bird_type_selection: {
        responses: {
            "breed_parakeet": { message: "Los periquitos son muy sociables y divertidos. Puedes <a href='adopcion.html?type=bird&breed=parakeet' target='_blank'>ver periquitos disponibles aquí</a>.", context: null },
            "breed_canary": { message: "Los canarios son conocidos por su hermoso canto. Puedes <a href='adopcion.html?type=bird&breed=canary' target='_blank'>ver canarios disponibles aquí</a>.", context: null },
            "breed_parrot": { message: "Los loros son muy inteligentes y requieren mucha interacción. Puedes <a href='adopcion.html?type=bird&breed=parrot' target='_blank'>ver loros disponibles aquí</a>.", context: null },
            "breed_other_birds": { message: "Entendido, puedes <a href='adopcion.html?type=bird&breed=other' target='_blank'>ver otras aves disponibles aquí</a>.", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona un tipo de ave."
    },
    other_pet_type_selection: {
        responses: {
            "type_hamster": { message: "Los hámsters son mascotas pequeñas y activas. Puedes <a href='adopcion.html?type=hamster' target='_blank'>ver hámsters disponibles aquí</a>.", context: null },
            "type_turtle": { message: "Las tortugas son mascotas de larga vida que requieren un entorno específico. Puedes <a href='adopcion.html?type=turtle' target='_blank'>ver tortugas disponibles aquí</a>.", context: null },
            "type_fish": { message: "Los peces son una adición tranquila a cualquier hogar. Puedes <a href='adopcion.html?type=fish' target='_blank'>ver peces disponibles aquí</a>.", context: null },
            "type_reptile": { message: "Los reptiles necesitan entornos muy controlados. Puedes <a href='adopcion.html?type=reptile' target='_blank'>ver reptiles disponibles aquí</a>.", context: null },
            "type_other_exotic": { message: "Entendido, puedes <a href='adopcion.html?type=other' target='_blank'>ver otras mascotas exóticas disponibles aquí</a>.", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona un tipo de mascota o di 'Volver al menú principal'."
    },
    info: {
      message: "📚 Aquí tienes información útil sobre cuidados de mascotas:",
      options: ["Cuidados básicos", "Alimentación", "Entrenamiento", "Salud", "Volver al menú principal"],
      context: "info_type_selection"
    },
    info_type_selection: {
        responses: {
            "care_basic": { message: "Los cuidados básicos incluyen alimentación adecuada, agua fresca, un refugio seguro y ejercicio regular. Para más detalles, visita nuestra sección de <a href='informacion.html#cuidados-basicos' target='_blank'>Guías de Cuidado</a>.", context: null },
            "care_feeding": { message: "Una dieta balanceada es crucial. La cantidad y tipo de alimento varían según la especie, edad y nivel de actividad. Puedes usar nuestra <button type='button' class='inline-action-btn' data-action='food_calculator_modal'>Calculadora de Comida</button> o consultar la sección de <a href='informacion.html#alimentacion' target='_blank'>Alimentación Saludable</a>.", context: null },
            "care_training": { message: "El entrenamiento positivo es clave para una buena convivencia. Ofrecemos recursos y talleres. Visita nuestra sección de <a href='informacion.html#entrenamiento' target='_blank'>Entrenamiento y Comportamiento</a> para más información.", context: null },
            "care_health": { message: "Es vital llevar a tu mascota al veterinario regularmente y estar atento a cualquier síntoma inusual. Para emergencias, usa nuestra función de <button type='button' class='inline-action-btn' data-action='emergency_modal'>Emergencia Veterinaria</button>. También tenemos una sección de <a href='informacion.html#salud' target='_blank'>Salud y Bienestar Animal</a>.", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona un tema de información o di 'Volver al menú principal'."
    },
    donate: {
      message: "❤️ ¡Gracias por querer ayudar! Las donaciones nos permiten seguir rescatando animales. ¿Cómo quieres ayudar?",
      options: ["Donación económica", "Donación de suministros", "Hacerme voluntario", "Apadrinar una mascota", "Volver al menú principal"],
      context: "donation_type_selection"
    },
    donation_type_selection: {
        responses: {
            "donate_money": { message: "Tu aporte económico es vital. Puedes hacer una donación segura en nuestra página de <a href='donar.html#economica' target='_blank'>Donaciones</a>. ¡Cada euro cuenta!", context: null },
            "donate_supplies": { message: "Aceptamos alimentos, mantas, juguetes y medicinas. Revisa nuestra lista de necesidades en la página de <a href='donar.html#suministros' target='_blank'>Donación de Suministros</a> para saber qué necesitamos más.", context: null },
            "become_volunteer": { message: "¡Nos encantaría tenerte en nuestro equipo! Puedes registrarte como voluntario en la sección de <a href='donar.html#voluntariado' target='_blank'>Voluntariado</a>. ¡Tu tiempo es un regalo invaluable!", context: null },
            "sponsor_pet": { message: "Apadrinar a una mascota es una hermosa forma de ayudar a largo plazo. Conoce más sobre cómo apadrinar en nuestra página de <a href='donar.html#apadrinar' target='_blank'>Apadrinamiento</a>.", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona un tipo de donación o di 'Volver al menú principal'."
    },
    events: {
        message: "🗓️ ¡Nos encanta que te intereses en nuestros eventos! Tenemos jornadas de adopción, talleres y campañas. Puedes ver nuestro calendario completo en la página de <a href='eventos.html' target='_blank'>Eventos</a>.",
        options: ["Ver próximos eventos", "Eventos pasados", "Agendar recordatorio", "Volver al menú principal"],
        context: "events_action_selection"
    },
    events_action_selection: {
        responses: {
            "events_upcoming": { message: "Puedes ver todos nuestros próximos eventos y registrarte en ellos directamente en nuestra página de <a href='eventos.html#proximos' target='_blank'>Eventos</a>.", context: null },
            "events_past": { message: "Si quieres ver lo que hemos logrado, puedes revisar nuestros eventos pasados en la sección de <a href='eventos.html#pasados' target='_blank'>Eventos Anteriores</a>.", context: null },
            "events_schedule_reminder": { message: "Para agendar un recordatorio, por favor, dime el nombre del evento y la fecha (ej. 'Jornada de Adopción el 20 de Mayo').", context: "set_reminder_context" }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona una opción de evento o di 'Volver al menú principal'."
    },
    set_reminder_context: { // Contexto para agendar recordatorios
        responses: {
            // Estas respuestas ahora se manejan dentro del handler para procesar el texto libre
            "default": { message: "Entendido, intentaré agendar un recordatorio para tu evento. ¡Gracias por tu interés!", context: null }
        },
        options: ["Volver al menú principal"],
        // Nuevo handler para procesar el texto libre del usuario
        handler: (text) => {
            // Intenta extraer el nombre del evento y la fecha
            const eventMatch = text.match(/(jornada de adopción|taller|campaña|evento|cita veterinaria|medicación|recordatorio)\s*(el|para)?\s*(\d{1,2}\s*(de)?\s*[a-zñáéíóú]+\s*(\d{4})?)?/i);
            let eventName = "un evento";
            let eventDate = "fecha no especificada";

            if (eventMatch) {
                eventName = eventMatch[1] || eventName;
                eventDate = eventMatch[3] || eventDate;
            }

            addMessage(`Recordatorio para "${eventName}" el ${eventDate} ha sido agendado. ¡No te lo pierdas!`, 'bot');
            addMessage(`¿Hay algo más en lo que pueda ayudarte?`, 'bot', false, knowledgeBase.greeting.options); // Ofrecer opciones principales
            state.currentContext = null;
        }
    },
    contact: {
        message: "📞 Si necesitas contactarnos directamente, puedes encontrar toda nuestra información en la página de <a href='contacto.html' target='_blank'>Contacto</a>. ¡Estamos listos para ayudarte!",
        options: ["Enviar un mensaje", "Llamar por teléfono", "Visitar el refugio", "Volver al menú principal"],
        context: "contact_action_selection"
    },
    contact_action_selection: {
        responses: {
            "contact_message": { message: "Puedes usar el formulario de contacto en nuestra página de <a href='contacto.html#formulario' target='_blank'>Contacto</a> para enviarnos un mensaje.", context: null },
            "contact_call": { message: "Nuestro número de teléfono es +57 300 123 4567. Estamos disponibles de Lun-Vie, 9am-6pm.", context: null },
            "contact_visit": { message: "Nuestra dirección es Calle 123 #45-67, Montería, Córdoba. Te recomendamos agendar una visita previamente en la página de <a href='contacto.html#visita' target='_blank'>Contacto</a>.", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona una opción de contacto o di 'Volver al menú principal'."
    },
    profile: {
        message: "👤 Para gestionar tus adopciones, favoritos, eventos y configuración de cuenta, visita tu <a href='perfil.html' target='_blank'>Perfil de Usuario</a>.",
        options: ["Ver mis adopciones", "Ver mis favoritos", "Configuración de cuenta", "Cerrar sesión", "Volver al menú principal"],
        context: "profile_action_selection"
    },
    profile_action_selection: {
        responses: {
            "profile_adoptions": { message: "Puedes ver el historial de tus mascotas adoptadas en la sección de <a href='perfil.html#adoptions' target='_blank'>Mis Adopciones</a> en tu perfil.", context: null },
            "profile_favorites": { message: "Tus mascotas favoritas están guardadas en la sección de <a href='perfil.html#favorites' target='_blank'>Favoritos</a> de tu perfil.", context: null },
            "profile_settings": { message: "Puedes actualizar tu información personal y preferencias en la sección de <a href='perfil.html#settings' target='_blank'>Configuración</a> de tu perfil.", context: null },
            "profile_logout": { message: "Si deseas cerrar sesión, puedes hacerlo desde tu <a href='perfil.html' target='_blank'>Perfil de Usuario</a>. ¡Esperamos verte pronto!", context: null }
        },
        options: ["Volver al menú principal"],
        default: "Por favor, selecciona una opción de perfil o di 'Volver al menú principal'."
    },
    farewell: {
      message: "🐾 ¡Ha sido un placer ayudarte! Si necesitas algo más, estaré aquí. ¡Que tengas un lindo día!",
      options: ["Nueva consulta", "Cerrar chat"]
    },
    error: {
      message: "🐾 ¡Ups! No entendí eso. Por favor, intenta reformular tu pregunta o selecciona una de las opciones. Puedes decir 'Ayuda' para ver las opciones principales.",
      options: ["Adoptar una mascota", "Donar al refugio", "Información sobre cuidados", "Eventos", "Contacto", "Mi perfil"]
    },
    emergency_info: {
      symptoms: [
        "Dificultad para respirar", "Vómitos o diarrea persistentes", "Convulsiones",
        "Trauma grave (caídas, accidentes)", "Ingestión de sustancias tóxicas",
        "Incapacidad para orinar o defecar", "Hinchazón abdominal", "Pérdida de conciencia"
      ],
      advice: "Si observas alguno de estos síntomas, contacta a un veterinario inmediatamente."
    }
  };

  // ==================== DATOS DE MASCOTAS (Simulados) ====================
  const petsDatabase = {
    dogs: [
      {
        id: 1, name: "Max", type: "Perro", breed: "Labrador", size: "Grande", gender: "Macho", age: "2 años",
        description: "Max es un labrador juguetón y cariñoso. Le encanta jugar con pelotas y nadar.",
        image: "https://images.pexels.com/photos/1591942/pexels-photo-1591942.jpeg?auto=compress&cs=tinysrgb&w=600", status: "Disponible"
      },
      {
        id: 2, name: "Luna", type: "Perro", breed: "Beagle", size: "Mediano", gender: "Hembra", age: "3 años",
        description: "Luna es tranquila y dulce. Perfecta para familias con niños pequeños.",
        image: "https://images.pexels.com/photos/1564506/pexels-photo-1564506.jpeg?auto=compress&cs=tinysrgb&w=600", status: "Disponible"
      },
      {
        id: 5, name: "Rocky", type: "Perro", breed: "Pastor Alemán", size: "Grande", gender: "Macho", age: "4 años",
        description: "Rocky es un perro guardián leal y protector, ideal para un hogar con espacio.",
        image: "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600", status: "Disponible"
      }
    ],
    cats: [
      {
        id: 3, name: "Milo", type: "Gato", breed: "Siamés", size: "Pequeño", gender: "Macho", age: "1 año",
        description: "Milo es curioso y activo. Le encanta trepar y explorar.",
        image: "https://images.pexels.com/photos/1056247/pexels-photo-1056247.jpeg?auto=compress&cs=tinysrgb&w=600", status: "Disponible"
      },
      {
        id: 4, name: "Bella", type: "Gato", breed: "Persa", size: "Pequeño", gender: "Hembra", age: "5 años",
        description: "Bella es una gata tranquila y cariñosa, perfecta para un ambiente relajado.",
        image: "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=600", status: "Disponible"
      }
    ],
    // Aunque vacíos, se mantienen para la estructura y futuras adiciones
    rabbits: [], 
    birds: []
  };

  // ==================== FUNCIONES PRINCIPALES ====================
  function init() {
    setupEventListeners();
    applyAccessibilitySettings(); // Aplicar configuración de accesibilidad al inicio
    initVoiceRecognition();
    loadConversationHistory();
    showWelcomeMessage();
    startNotificationInterval();
    
    // Restaurar visibilidad del chat si estaba abierto
    if (localStorage.getItem('chatbotVisible') === 'true') {
      toggleChatbot(false);
    }
  }

  function setupEventListeners() {
    // Toggle del chatbot
    elements.chatbotToggle.addEventListener('click', () => toggleChatbot(true));
    elements.closeBtn.addEventListener('click', () => toggleChatbot(true));

    // Formulario de mensaje
    elements.chatbotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const message = elements.userInput.value.trim();
      if (message) {
        sendMessage(message);
        elements.userInput.value = '';
        elements.userInput.focus();
      }
    });

    // Habilitar/deshabilitar botón de enviar
    elements.userInput.addEventListener('input', toggleSendButton);

    // Delegación de eventos para botones de acción rápida y opciones inline
    elements.chatbotMessages.addEventListener('click', function(e) {
      if (e.target.classList.contains('quick-action-btn') || e.target.classList.contains('inline-action-btn') || e.target.classList.contains('chat-option-button')) {
        handleButtonAction(e.target.dataset.action);
      } else if (e.target.closest('.pet-btn')) { // Delegación para botones de mascota
        const button = e.target.closest('.pet-btn');
        const petCard = button.closest('.pet-card');
        const petId = parseInt(petCard.dataset.petId); // Obtener el ID de la tarjeta
        const action = button.dataset.action; // Obtener la acción del botón
        handlePetAction(petId, action);
      }
    });

    // Botones de accesibilidad y control de conversación
    if (elements.voiceBtn) elements.voiceBtn.addEventListener('click', toggleVoiceRecognition);
    if (elements.textSizeBtn) elements.textSizeBtn.addEventListener('click', toggleTextSize);
    if (elements.highContrastBtn) elements.highContrastBtn.addEventListener('click', toggleHighContrast);
    if (elements.clearBtn) elements.clearBtn.addEventListener('click', clearConversation);
    if (elements.restartBtn) elements.restartBtn.addEventListener('click', restartChatbot);
    
    // El menú de opciones y su toggle han sido eliminados del HTML
    /*
    if (elements.optionsMenuToggle) {
        elements.optionsMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que el click se propague y cierre el menú inmediatamente
            if (elements.optionsMenu) {
                elements.optionsMenu.classList.toggle('hidden');
            }
        });
    }

    // Cerrar menú de opciones al hacer clic fuera
    document.addEventListener('click', function(e) {
      if (elements.optionsMenu && elements.optionsMenuToggle && !elements.optionsMenu.contains(e.target) && !elements.optionsMenuToggle.contains(e.target) && !elements.optionsMenu.classList.contains('hidden')) {
          elements.optionsMenu.classList.add('hidden');
      }
    });
    */

    // Cerrar modales
    elements.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        this.closest('.modal').classList.add('hidden');
      });
    });

    // Cerrar modal al hacer clic fuera del contenido del modal
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.add('hidden');
        }
      });
    });

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal:not(.hidden)');
        if (openModal) {
          openModal.classList.add('hidden');
        }
        // El menú de opciones ha sido eliminado
        /*
        if (elements.optionsMenu && !elements.optionsMenu.classList.contains('hidden')) {
            elements.optionsMenu.classList.add('hidden');
        }
        */
      }
    });

    // Calculadora de comida
    if (elements.foodCalculatorForm) {
        elements.foodCalculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateFood();
        });
    }
    // Manejador para el botón "Guardar plan" (simulado)
    if (elements.savePlanBtn) {
        elements.savePlanBtn.addEventListener('click', () => {
            showNotification('Plan de comida guardado (simulado).', 'success');
        });
    }

    // Botones del modal de emergencia
    if (elements.callVetBtn) elements.callVetBtn.addEventListener('click', () => showNotification('Simulando llamada al veterinario...', 'info'));
    if (elements.findClinicBtn) elements.findClinicBtn.addEventListener('click', () => showNotification('Simulando búsqueda de clínica cercana...', 'info'));
    if (elements.petAmbulanceBtn) elements.petAmbulanceBtn.addEventListener('click', () => showNotification('Simulando solicitud de ambulancia...', 'info'));
  }

  // ==================== FUNCIONES DEL CHAT ====================
  /**
   * Abre o cierra la ventana del chatbot.
   * @param {boolean} animate - Si se debe aplicar la animación de apertura/cierre.
   */
  function toggleChatbot(animate) {
    state.isOpen = !state.isOpen;
    
    if (state.isOpen) {
      elements.chatbotWindow.classList.remove('hidden');
      elements.notificationBadge.textContent = '0';
      state.unreadMessages = 0;
      elements.chatbotToggle.setAttribute('aria-expanded', 'true');
      
      if (animate) {
        setTimeout(() => {
          elements.chatbotWindow.classList.add('active');
          scrollToBottom();
        }, 10);
      } else {
        elements.chatbotWindow.classList.add('active');
        scrollToBottom();
      }
      
      localStorage.setItem('chatbotVisible', 'true');
      // Cuando el chat se abre, detener el intervalo de notificación
      if (state.notificationInterval) {
        clearInterval(state.notificationInterval);
        state.notificationInterval = null;
      }
      checkUnreadMessages(); // Asegura que el badge se actualice si hay 0 mensajes
    } else {
      elements.chatbotWindow.classList.remove('active');
      elements.chatbotToggle.setAttribute('aria-expanded', 'false');
      
      if (animate) {
        setTimeout(() => {
          elements.chatbotWindow.classList.add('hidden');
        }, 300);
      } else {
        elements.chatbotWindow.classList.add('hidden');
      }
      
      localStorage.setItem('chatbotVisible', 'false');
      // Cuando el chat se cierra, reiniciar el intervalo de notificación
      startNotificationInterval();
    }
  }

  /**
   * Habilita o deshabilita el botón de enviar mensaje.
   */
  function toggleSendButton() {
    if (elements.sendBtn) {
        elements.sendBtn.disabled = elements.userInput.value.trim() === '';
    }
  }

  /**
   * Envía un mensaje del usuario al chatbot (cuando el usuario escribe).
   * @param {string} text - El texto del mensaje del usuario.
   */
  function sendMessage(text) {
    // Añadir el mensaje del usuario a la pantalla y al historial
    addMessage(text, 'user');
    state.conversationHistory.push({
      type: 'user',
      message: text,
      timestamp: new Date().toISOString()
    });
    saveConversationHistory();

    showTypingIndicator();
    
    // Simular tiempo de respuesta del bot y procesar el mensaje
    setTimeout(() => {
      removeTypingIndicator();
      handleBotResponseLogic(text); // Procesar la lógica de respuesta del bot
    }, 800 + Math.random() * 1200);
  }

  /**
   * Procesa la acción de un botón (rápido o de menú) sin añadir el texto a la conversación como mensaje de usuario.
   * Se modificó para que ciertas acciones no añadan el mensaje del usuario al historial.
   * @param {string} actionKey - La clave de acción asociada al botón (desde data-action).
   */
  function handleButtonAction(actionKey) {
    let buttonText = actionKey; // Valor por defecto si no se encuentra
    // Busca el botón clickeado en el formulario (quick-actions)
    const clickedButtonInForm = elements.chatbotForm.querySelector(`[data-action="${actionKey}"]`);
    if (clickedButtonInForm) {
        buttonText = clickedButtonInForm.textContent.trim();
    } else {
        // También busca si es un botón de opción inline en el chat
        const inlineButtonInChat = elements.chatbotMessages.querySelector(`.chat-option-button[data-action="${actionKey}"]`);
        if (inlineButtonInChat) {
            buttonText = inlineButtonInChat.textContent.trim();
        }
    }

    // Definir acciones que no deben añadir el mensaje del usuario al historial de conversación
    const silentActions = [
        "toggle_high_contrast",
        "toggle_text_size",
        "emergency_modal",
        "food_calculator_modal",
        "clear_conversation",
        "restart_chatbot"
    ];

    // Condicionalmente añadir el mensaje del usuario al historial
    if (!silentActions.includes(actionKey)) {
        addMessage(buttonText, 'user');
        state.conversationHistory.push({
            type: 'user',
            message: buttonText,
            timestamp: new Date().toISOString()
        });
        saveConversationHistory();
    }

    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      handleBotResponseLogic(actionKey); // Procesa la lógica de respuesta del bot
    }, 800 + Math.random() * 1200);
  }

  /**
   * Contiene la lógica principal para determinar la respuesta del bot.
   * @param {string} input - El texto de entrada del usuario o la clave de acción de un botón.
   */
  function handleBotResponseLogic(input) {
    const lowerInput = String(input).toLowerCase(); // Asegurar que input sea string y convertir a minúsculas
    let botResponse = knowledgeBase.error; // Respuesta por defecto

    // 1. Manejo de contextos específicos (ej. obteniendo nombre o agendando recordatorio)
    if (state.currentContext === "get_name") {
        knowledgeBase.get_name.handler(input); // Usar el input original para el nombre
        return;
    } else if (state.currentContext === "set_reminder_context") {
        knowledgeBase.set_reminder_context.handler(input); // Usar el handler específico para recordatorios
        return;
    }

    // 2. Manejo de acciones específicas de botones (usando las claves data-action)
    // Esto es lo más fiable para las acciones rápidas.
    switch (input) { // Se compara directamente con la clave de acción
        case 'adopt':
            botResponse = knowledgeBase.adoption;
            break;
        case 'donate':
            botResponse = knowledgeBase.donate;
            break;
        case 'info':
            botResponse = knowledgeBase.info;
            break;
        case 'events':
            botResponse = knowledgeBase.events;
            break;
        case 'contact':
            botResponse = knowledgeBase.contact;
            break;
        case 'profile':
            botResponse = knowledgeBase.profile;
            break;
        case 'main_menu':
            botResponse = knowledgeBase.greeting;
            state.currentContext = null;
            break;
        case 'close_chat_window':
            botResponse = knowledgeBase.farewell;
            toggleChatbot(true); // Cierra la ventana del chat
            return; // No añadir mensaje de bot adicional
        case 'new_query':
            restartChatbot(); // Reinicia el chatbot para una nueva consulta
            return;

        // Acciones que abren modales o realizan acciones directas
        case 'emergency_modal':
            elements.emergencyModal.classList.remove('hidden');
            showNotification('Abriendo información de emergencia veterinaria.', 'info');
            // Ya no se añade mensaje al historial del chat
            return;
        case 'food_calculator_modal':
            elements.foodCalculatorModal.classList.remove('hidden');
            showNotification('Abriendo calculadora de comida para mascotas.', 'info');
            // Ya no se añade mensaje al historial del chat
            return;
        case 'toggle_high_contrast':
            toggleHighContrast();
            // showNotification se llama dentro de toggleHighContrast
            return;
        case 'toggle_text_size':
            toggleTextSize();
            // showNotification se llama dentro de toggleTextSize
            return;
        case 'clear_conversation':
            clearConversation(); // Solo limpia el estado y el DOM
            showNotification('Conversación limpiada.', 'info'); // Notificación temporal
            addMessage("La conversación ha sido limpiada. ¿En qué puedo ayudarte ahora?", 'bot', false, knowledgeBase.greeting.options); // Mensaje del bot en el chat
            return;
        case 'restart_chatbot':
            restartChatbot(); // Solo limpia el estado y el DOM
            showNotification('Chatbot reiniciado.', 'info'); // Notificación temporal
            addMessage("¡Hola de nuevo! Soy PawFriend, tu asistente virtual de Rescue Paws. ¿Cómo te llamas?", 'bot', false, knowledgeBase.greeting.options); // Mensaje del bot en el chat
            return;
        // La acción 'toggle_options_menu' ha sido eliminada
        /*
        case 'toggle_options_menu': // Manejo del botón de 3 puntos
            if (elements.optionsMenu) {
                elements.optionsMenu.classList.toggle('hidden');
            }
            return; // No se necesita respuesta del bot para esto
        */
        
        // Manejo de tipos de mascotas y sus sub-opciones
        case 'dog_type':
            botResponse = knowledgeBase.pet_type_selection.responses.dog_type;
            break;
        case 'cat_type':
            botResponse = knowledgeBase.pet_type_selection.responses.cat_type;
            break;
        case 'rabbit_type':
            botResponse = knowledgeBase.pet_type_selection.responses.rabbit_type;
            break;
        case 'bird_type':
            botResponse = knowledgeBase.bird_type_selection.responses.bird_type;
            break;
        case 'other_type':
            botResponse = knowledgeBase.pet_type_selection.responses.other_type;
            break;
        
        // Manejo de tamaños de perro
        case 'size_small':
            botResponse = knowledgeBase.dog_size_selection.responses.size_small;
            break;
        case 'size_medium':
            botResponse = knowledgeBase.dog_size_selection.responses.size_medium;
            break;
        case 'size_large':
            botResponse = knowledgeBase.dog_size_selection.responses.size_large;
            break;
        case 'size_no_preference':
            botResponse = knowledgeBase.dog_size_selection.responses.size_no_preference;
            break;
        case 'view_all_dogs':
            botResponse = knowledgeBase.dog_size_selection.responses.view_all_dogs;
            break;

        // Manejo de género de perro
        case 'gender_male':
            botResponse = knowledgeBase.dog_gender_selection.responses.gender_male;
            break;
        case 'gender:female': // Usar el nuevo actionKey
            botResponse = knowledgeBase.dog_gender_selection.responses['gender:female'];
            break;

        // Manejo de rasgos de gato
        case 'trait_playful':
            botResponse = knowledgeBase.cat_trait_selection.responses.trait_playful;
            break;
        case 'trait_calm':
            botResponse = knowledgeBase.cat_trait_selection.responses.trait_calm;
            break;
        case 'trait_affectionate':
            botResponse = knowledgeBase.cat_trait_selection.responses.trait_affectionate;
            break;
        case 'trait_independent':
            botResponse = knowledgeBase.cat_trait_selection.responses.trait_independent;
            break;
        case 'view_all_cats':
            botResponse = knowledgeBase.cat_trait_selection.responses.view_all_cats;
            break;

        // Manejo de experiencia con conejos
        case 'exp_yes':
            botResponse = knowledgeBase.rabbit_experience_selection.responses.exp_yes;
            break;
        case 'exp_no':
            botResponse = knowledgeBase.rabbit_experience_selection.responses.exp_no;
            break;
        
        // Manejo de tipos de aves
        case 'breed_parakeet':
            botResponse = knowledgeBase.bird_type_selection.responses.breed_parakeet;
            break;
        case 'breed_canary':
            botResponse = knowledgeBase.bird_type_selection.responses.breed_canary;
            break;
        case 'breed_parrot':
            botResponse = knowledgeBase.bird_type_selection.responses.breed_parrot;
            break;
        case 'breed_other_birds':
            botResponse = knowledgeBase.bird_type_selection.responses.breed_other_birds;
            break;

        // Manejo de otros tipos de mascotas
        case 'type_hamster':
            botResponse = knowledgeBase.other_pet_type_selection.responses.type_hamster;
            break;
        case 'type_turtle':
            botResponse = knowledgeBase.other_pet_type_selection.responses.type_turtle;
            break;
        case 'type_fish':
            botResponse = knowledgeBase.other_pet_type_selection.responses.type_fish;
            break;
        case 'type_reptile':
            botResponse = knowledgeBase.other_pet_type_selection.responses.type_reptile;
            break;
        case 'type_other_exotic':
            botResponse = knowledgeBase.other_pet_type_selection.responses.type_other_exotic;
            break;

        // Manejo de información de cuidados
        case 'care_basic':
            botResponse = knowledgeBase.info_type_selection.responses.care_basic;
            break;
        case 'care_feeding':
            botResponse = knowledgeBase.info_type_selection.responses.care_feeding;
            break;
        case 'care_training':
            botResponse = knowledgeBase.info_type_selection.responses.care_training;
            break;
        case 'care_health':
            botResponse = knowledgeBase.info_type_selection.responses.care_health;
            break;

        // Manejo de donaciones
        case 'donate_money':
            botResponse = knowledgeBase.donation_type_selection.responses.donate_money;
            break;
        case 'donate_supplies':
            botResponse = knowledgeBase.donation_type_selection.responses.donate_supplies;
            break;
        case 'become_volunteer':
            botResponse = knowledgeBase.donation_type_selection.responses.become_volunteer;
            break;
        case 'sponsor_pet':
            botResponse = knowledgeBase.donation_type_selection.responses.sponsor_pet;
            break;

        // Manejo de eventos
        case 'events_upcoming':
            botResponse = knowledgeBase.events_action_selection.responses.events_upcoming;
            break;
        case 'events_past':
            botResponse = knowledgeBase.events_action_selection.responses.events_past;
            break;
        case 'events_schedule_reminder':
            botResponse = knowledgeBase.events_action_selection.responses.events_schedule_reminder;
            break;

        // Manejo de recordatorios específicos (estos ya no se usan directamente aquí, sino en el handler de set_reminder_context)
        case 'reminder_vet_appointment':
        case 'reminder_medication':
        case 'reminder_event':
        case 'reminder_other':
            // Estas acciones ahora se manejan dentro del handler de set_reminder_context
            // Si llegan aquí, significa que no se procesaron en el contexto, se les da una respuesta por defecto
            botResponse = knowledgeBase.set_reminder_context.responses.default;
            break;

        // Manejo de contacto
        case 'contact_message':
            botResponse = knowledgeBase.contact_action_selection.responses.contact_message;
            break;
        case 'contact_call':
            botResponse = knowledgeBase.contact_action_selection.responses.contact_call;
            break;
        case 'contact_visit':
            botResponse = knowledgeBase.contact_action_selection.responses.contact_visit;
            break;

        // Manejo de perfil
        case 'profile_adoptions':
            botResponse = knowledgeBase.profile_action_selection.responses.profile_adoptions;
            break;
        case 'profile_favorites':
            botResponse = knowledgeBase.profile_action_selection.responses.profile_favorites;
            break;
        case 'profile_settings':
            botResponse = knowledgeBase.profile_action_selection.responses.profile_settings;
            break;
        case 'profile_logout':
            botResponse = knowledgeBase.profile_action_selection.responses.profile_logout;
            break;
        
        // Manejo de otras acciones generales
        case 'notify_new_pets':
            addMessage("¡Excelente! Te avisaremos cuando tengamos nuevas mascotas disponibles. ¡Gracias!", 'bot');
            addMessage(`¿Hay algo más en lo que pueda ayudarte?`, 'bot', false, knowledgeBase.greeting.options); // Ofrecer opciones principales
            state.currentContext = null;
            return;
        case 'no_notify_new_pets':
            addMessage("Entendido. Si cambias de opinión, ya sabes dónde encontrarme.", 'bot');
            addMessage(`¿Hay algo más en lo que pueda ayudarte?`, 'bot', false, knowledgeBase.greeting.options); // Ofrecer opciones principales
            state.currentContext = null;
            return;
        case 'request_pet_info':
            addMessage("Para qué mascota te gustaría solicitar información?", 'bot');
            addMessage(`Puedes seleccionar un tipo de mascota o volver al menú principal.`, 'bot', false, ["Ver todos los perros", "Ver todos los gatos", "Volver al menú principal"]);
            state.currentContext = "adoption_info_request"; // Nuevo contexto
            return;
        case 'schedule_pet_visit':
            addMessage("Para agendar una visita, por favor, dime el nombre de la mascota y la fecha preferida.", 'bot');
            state.currentContext = "schedule_visit_request"; // Nuevo contexto
            return;
        case 'view_more_pet_options':
            addMessage("¿Qué más te gustaría ver?", 'bot');
            addMessage(`Puedes seleccionar una opción.`, 'bot', false, ["Ver todos los perros", "Ver todos los gatos", "Ver otras mascotas", "Volver al menú principal"]);
            state.currentContext = null;
            return;
        case 'share_location':
            addMessage("Por favor, comparte tu ubicación a través de tu navegador para encontrar clínicas cercanas.", 'bot');
            showNotification('Solicitando permiso de ubicación...', 'info');
            // Simular petición de ubicación
            setTimeout(() => {
                showNotification('Ubicación obtenida. Mostrando clínicas cercanas en el mapa.', 'success');
                addMessage("Aquí tienes algunas clínicas cercanas: [Enlace a mapa con clínicas]", 'bot', true);
                addMessage(`¿Hay algo más en lo que pueda ayudarte?`, 'bot', false, knowledgeBase.greeting.options); // Ofrecer opciones principales
            }, 2000);
            state.currentContext = null;
            return;
        case 'search_by_city':
            addMessage("Por favor, dime la ciudad y el país para buscar refugios.", 'bot');
            state.currentContext = "get_city_for_shelters";
            return;

        default:
            // 3. Si no es una acción de botón, intenta con el procesamiento de lenguaje natural (texto escrito)
            if (lowerInput.includes("hola") || lowerInput.includes("hi") || lowerInput.includes("hey") || lowerInput.includes("buenos días") || lowerInput.includes("buenas tardes") || lowerInput.includes("buenas noches")) {
                botResponse = knowledgeBase.greeting;
            } else if (lowerInput.includes("gracias") || lowerInput.includes("thank you") || lowerInput.includes("thanks")) {
                const responses = [
                    "¡De nada! Estoy aquí para ayudar. �",
                    "¡Es un placer ayudarte! 😊",
                    "¡Gracias a ti por preocuparte por los animales! ❤️"
                ];
                botResponse = { message: responses[Math.floor(Math.random() * responses.length)] };
            } else if (lowerInput.includes("adiós") || lowerInput.includes("chao") || lowerInput.includes("hasta luego") || lowerInput.includes("nos vemos") || lowerInput.includes("bye")) {
                botResponse = knowledgeBase.farewell;
            } else if (lowerInput.includes("ayuda") || lowerInput.includes("opciones")) {
                botResponse = knowledgeBase.error;
            } else {
                // Si aún no hay coincidencia, verifica las respuestas específicas del contexto actual para texto
                if (state.currentContext && knowledgeBase[state.currentContext] && knowledgeBase[state.currentContext].responses) {
                    const contextResponses = knowledgeBase[state.currentContext].responses;
                    let foundContextResponse = false;
                    for (const key in contextResponses) {
                        // Aquí se usa el lowerInput porque es texto libre del usuario
                        // Se adapta la regex para que sea más flexible con el texto libre
                        const regex = new RegExp(`\\b${key.replace(/_/g, '\\b.*\\b')}\\b`, 'i'); 
                        if (regex.test(lowerInput)) {
                            botResponse = contextResponses[key];
                            foundContextResponse = true;
                            break;
                        }
                    }
                    if (!foundContextResponse && knowledgeBase[state.currentContext].default) {
                        botResponse = {
                            message: knowledgeBase[state.currentContext].default,
                            options: knowledgeBase[state.currentContext].options,
                            context: knowledgeBase[state.currentContext].context
                        };
                    } else if (!foundContextResponse) { // Si no hay respuesta específica en el contexto, usar error por defecto
                        botResponse = knowledgeBase.error;
                    }
                } else {
                    botResponse = knowledgeBase.error; // Sin contexto, error general
                }
            }
            break;
    }

    // Determine options to display in the chat message
    let optionsToDisplay = botResponse.options || [];

    // If no specific options are provided for the current response, offer main menu options
    // This applies to cases where a direct answer is given, or an action completes without specific follow-up options.
    if (optionsToDisplay.length === 0 && botResponse !== knowledgeBase.farewell && botResponse !== knowledgeBase.error) {
        optionsToDisplay = knowledgeBase.greeting.options;
    } else if (botResponse === knowledgeBase.farewell) {
        // For farewell, specifically use its own options (Nueva consulta, Cerrar chat)
        optionsToDisplay = knowledgeBase.farewell.options;
    } else if (botResponse === knowledgeBase.error) {
        // For error, specifically use its own options
        optionsToDisplay = knowledgeBase.error.options;
    }

    // Ejecutar la respuesta del bot, pasando las opciones para que se muestren en el mensaje
    addMessage(botResponse.message || botResponse, 'bot', typeof botResponse.message === 'string' && (botResponse.message.includes('<a') || botResponse.message.includes('<button')), optionsToDisplay);
    
    // Asegurarse de que la barra de acciones rápidas esté oculta permanentemente para este flujo
    elements.quickActionsContainer.classList.add('hidden');

    state.currentContext = botResponse.context || null; // Actualizar contexto
    saveConversationHistory(); // Guardar el historial después de la respuesta del bot
  }

  /**
   * Añade un mensaje a la ventana del chat.
   * @param {string} text - El texto del mensaje.
   * @param {string} sender - 'user' o 'bot'.
   * @param {boolean} isHTML - Si el texto contiene HTML y debe ser insertado como tal.
   * @param {Array<string>} options - Array de textos para los botones de opción inline.
   */
  function addMessage(text, sender, isHTML = false, options = []) { 
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');

    if (isHTML) {
      contentDiv.innerHTML = text;
    } else {
      contentDiv.textContent = text;
    }
    messageElement.appendChild(contentDiv);

    // Añadir opciones inline si se proporcionan
    if (options.length > 0) {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('inline-options-container'); // Nuevo contenedor para estilos
        options.forEach(optionText => {
            const button = document.createElement('button');
            button.type = 'button';
            button.classList.add('chat-option-button'); // Nueva clase para botones inline
            button.textContent = optionText;
            button.dataset.action = knowledgeBase.quickActionMap[optionText] || optionText.toLowerCase().replace(/\s/g, '_');
            optionsContainer.appendChild(button);
        });
        messageElement.appendChild(optionsContainer);
    }

    const timeElement = document.createElement('div');
    timeElement.classList.add('message-time');
    timeElement.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageElement.appendChild(timeElement);

    elements.chatbotMessages.appendChild(messageElement);
    scrollToBottom();

    if (sender === 'bot' && !state.isOpen) {
      state.unreadMessages++;
      checkUnreadMessages();
    }
  }

  /**
   * Muestra un indicador de "escribiendo..."
   */
  function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    elements.chatbotMessages.appendChild(typingIndicator);
    scrollToBottom();
  }

  /**
   * Elimina el indicador de "escribiendo..."
   */
  function removeTypingIndicator() {
    const typingIndicator = elements.chatbotMessages.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  /**
   * Muestra los botones de acción rápida en la barra inferior.
   * @param {Array<string>} options - Array de textos para los botones.
   */
  function showQuickActions(options) {
    elements.quickActionsContainer.innerHTML = ''; // Limpiar acciones anteriores

    options.forEach(optionText => {
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add('quick-action-btn');
      button.textContent = optionText;
      // Usar el mapeo para obtener la clave data-action
      button.dataset.action = knowledgeBase.quickActionMap[optionText] || optionText.toLowerCase().replace(/\s/g, '_');
      elements.quickActionsContainer.appendChild(button);
    });
    // Asegurarse de que el contenedor de quick actions sea visible si se llama a esta función
    elements.quickActionsContainer.classList.remove('hidden');
    scrollToBottom();
  }

  /**
   * Desplaza el scroll al final de los mensajes.
   */
  function scrollToBottom() {
    elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;
  }

  /**
   * Carga el historial de conversación desde localStorage.
   */
  function loadConversationHistory() {
    elements.chatbotMessages.innerHTML = '';
    state.conversationHistory.forEach(msg => {
      // Al cargar, no se pueden recrear los botones inline directamente desde el historial de texto.
      // Si un mensaje tenía opciones, se debería re-evaluar la lógica del bot para mostrarlas.
      // Por simplicidad, aquí solo se carga el texto.
      addMessage(msg.message, msg.type, msg.message.includes('<a') || msg.message.includes('<button'));
    });
    scrollToBottom();
  }

  /**
   * Guarda el historial de conversación en localStorage.
   */
  function saveConversationHistory() {
    localStorage.setItem('pawfriend_chatHistory', JSON.stringify(state.conversationHistory));
  }

  /**
   * Muestra un mensaje de bienvenida al iniciar el chatbot.
   */
  function showWelcomeMessage() {
    if (state.conversationHistory.length === 0) {
      // Mostrar el mensaje de bienvenida con las opciones directamente en el chat
      addMessage(knowledgeBase.greeting.message, 'bot', false, knowledgeBase.greeting.options);
      state.currentContext = knowledgeBase.greeting.context;
      saveConversationHistory();
    }
  }

  /**
   * Limpia toda la conversación del chatbot.
   * Se modificó para que no añada mensajes al historial del chat directamente.
   */
  function clearConversation() {
    state.conversationHistory = [];
    localStorage.removeItem('pawfriend_chatHistory');
    elements.chatbotMessages.innerHTML = '';
    state.currentContext = null; // Reset context
  }

  /**
   * Reinicia el chatbot a su estado inicial.
   * Se modificó para que no añada mensajes al historial del chat directamente.
   */
  function restartChatbot() {
    state.conversationHistory = []; // Clear history
    localStorage.removeItem('pawfriend_chatHistory');
    elements.chatbotMessages.innerHTML = ''; // Clear DOM
    state.userName = null;
    localStorage.removeItem('pawfriend_userName');
    state.favoritePets = [];
    localStorage.removeItem('pawfriend_favorites');
    state.currentContext = "get_name"; // Set initial context
  }

  // ==================== FUNCIONES DE ACCESIBILIDAD ====================

  /**
   * Inicializa el reconocimiento de voz.
   */
  function initVoiceRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      state.recognition = new SpeechRecognition();
      state.recognition.continuous = false; // Escucha una sola vez
      state.recognition.lang = 'es-ES'; // Idioma español

      state.recognition.onstart = function() {
        state.isListening = true;
        elements.voiceBtn.classList.add('active');
        elements.voiceBtn.querySelector('i').classList.remove('fa-microphone');
        elements.voiceBtn.querySelector('i').classList.add('fa-microphone-alt-slash');
        showNotification('Escuchando...', 'info');
      };

      state.recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        elements.userInput.value = transcript;
        elements.chatbotForm.dispatchEvent(new Event('submit'));
      };

      state.recognition.onerror = function(event) {
        console.error('Error de reconocimiento de voz:', event.error);
        if (event.error === 'no-speech') {
          showNotification('No se detectó voz. Intenta de nuevo.', 'warning');
        } else if (event.error === 'not-allowed') {
          showNotification('Permiso de micrófono denegado. Por favor, habilítalo en la configuración de tu navegador.', 'danger');
        } else {
          showNotification(`Error de voz: ${event.error}`, 'danger');
        }
        state.isListening = false;
        elements.voiceBtn.classList.remove('active');
        elements.voiceBtn.querySelector('i').classList.remove('fa-microphone-alt-slash');
        elements.voiceBtn.querySelector('i').classList.add('fa-microphone');
      };

      state.recognition.onend = function() {
        state.isListening = false;
        elements.voiceBtn.classList.remove('active');
        elements.voiceBtn.querySelector('i').classList.remove('fa-microphone-alt-slash');
        elements.voiceBtn.querySelector('i').classList.add('fa-microphone');
      };
    } else {
      if (elements.voiceBtn) elements.voiceBtn.style.display = 'none';
      console.warn('El reconocimiento de voz no es compatible con este navegador.');
    }
  }

  /**
   * Inicia o detiene el reconocimiento de voz.
   */
  function toggleVoiceRecognition() {
    if (!state.recognition) {
        showNotification('El reconocimiento de voz no está disponible en este navegador.', 'danger');
        return;
    }

    if (state.isListening) {
      state.recognition.stop();
      showNotification('Reconocimiento de voz detenido.', 'info');
    } else {
      state.recognition.start();
    }
  }

  /**
   * Aplica la configuración de accesibilidad guardada en localStorage.
   */
  function applyAccessibilitySettings() {
    // Aplicar alto contraste
    if (state.isHighContrast) {
      document.body.classList.add('high-contrast');
      if (elements.highContrastBtn) elements.highContrastBtn.classList.add('active');
    } else {
      document.body.classList.remove('high-contrast');
      if (elements.highContrastBtn) elements.highContrastBtn.classList.remove('active');
    }

    // Aplicar tamaño de texto
    document.body.classList.remove('text-large', 'text-xlarge');
    if (state.textSize === 'large') {
      document.body.classList.add('text-large');
      if (elements.textSizeBtn) elements.textSizeBtn.classList.add('active');
    } else if (state.textSize === 'xlarge') {
      document.body.classList.add('text-xlarge');
      if (elements.textSizeBtn) elements.textSizeBtn.classList.add('active');
    } else {
      if (elements.textSizeBtn) elements.textSizeBtn.classList.remove('active');
    }
  }

  /**
   * Alterna el modo de alto contraste.
   */
  function toggleHighContrast() {
    state.isHighContrast = !state.isHighContrast;
    localStorage.setItem('highContrast', state.isHighContrast);
    applyAccessibilitySettings();
    // El menú de opciones ha sido eliminado
    // if (elements.optionsMenu) elements.optionsMenu.classList.add('hidden');
    showNotification(`Modo Alto Contraste: ${state.isHighContrast ? 'Activado' : 'Desactivado'}`, 'info');
  }

  /**
   * Alterna el tamaño del texto entre normal, grande y extra grande.
   */
  function toggleTextSize() {
    const sizes = ['normal', 'large', 'xlarge'];
    let currentIndex = sizes.indexOf(state.textSize);
    currentIndex = (currentIndex + 1) % sizes.length;
    state.textSize = sizes[currentIndex];
    localStorage.setItem('textSize', state.textSize);
    applyAccessibilitySettings();
    // El menú de opciones ha sido eliminado
    // if (elements.optionsMenu) elements.optionsMenu.classList.add('hidden');
    showNotification(`Tamaño de texto: ${state.textSize.charAt(0).toUpperCase() + state.textSize.slice(1)}`, 'info');
  }

  // ==================== FUNCIONES DE MASCOTAS (Simuladas) ====================
  /**
   * Muestra las mascotas disponibles de un tipo específico.
   * @param {string} type - Tipo de mascota ('dogs', 'cats', etc.).
   */
  function showAvailablePets(type) {
    let pets = [];
    let message = "";
    
    switch(type) {
      case 'dogs':
        pets = petsDatabase.dogs;
        message = "🐕 Estos son los perritos disponibles para adopción:";
        break;
      case 'cats':
        pets = petsDatabase.cats;
        message = "🐈 Estos son los gatitos disponibles para adopción:";
        break;
      default:
        pets = [...petsDatabase.dogs, ...petsDatabase.cats];
        message = "🐾 Estas son las mascotas disponibles para adopción:";
    }
    
    addMessage(message, 'bot');
    
    if (pets.length === 0) {
      addMessage("Actualmente no tenemos mascotas disponibles de este tipo. ¿Te gustaría que te avisemos cuando lleguen nuevas?", 'bot', false, ["Sí, avísame", "No, gracias", "Volver al menú principal"]);
    } else {
      pets.forEach(pet => {
        const petCard = createPetCard(pet);
        addMessage(petCard, 'bot', true); // Aquí, isHTML es true, options no se pasa. Correcto.
      });
      addMessage("¿Te interesa alguna de estas mascotas o necesitas más información?", 'bot', false, ["Solicitar información", "Agendar visita", "Ver más opciones", "Volver al menú principal"]);
    }
    saveConversationHistory();
  }

  /**
   * Crea una tarjeta HTML para una mascota.
   * Se añade data-pet-id a la tarjeta para facilitar la delegación de eventos.
   * @param {Object} pet - Objeto con los datos de la mascota.
   * @returns {string} HTML de la tarjeta de la mascota.
   */
  function createPetCard(pet) {
    return `
      <div class="pet-card" data-pet-id="${pet.id}">
        <div class="pet-card-header">
          <img src="${pet.image}" alt="${pet.name}" class="pet-avatar" onerror="this.onerror=null;this.src='https://placehold.co/48x48/cccccc/333333?text=Pet';">
          <div class="pet-info">
            <div class="pet-name">${pet.name}</div>
            <div class="pet-meta">
              <span><i class="fas fa-paw"></i> ${pet.breed}</span>
              <span><i class="fas fa-ruler-combined"></i> ${pet.size}</span>
              <span><i class="fas fa-venus-mars"></i> ${pet.gender}</span>
              <span><i class="fas fa-birthday-cake"></i> ${pet.age}</span>
            </div>
          </div>
        </div>
        <p class="pet-description">${pet.description}</p>
        <div class="pet-actions">
          <button type="button" class="pet-btn pet-btn-primary" data-action="info">
            <i class="fas fa-info-circle"></i> Más info
          </button>
          <button type="button" class="pet-btn pet-btn-secondary" data-action="favorite">
            <i class="fas fa-heart"></i> Favorito
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Maneja acciones específicas de las mascotas (info, favorito).
   * Esta función ya no es global, se llama desde el manejador de eventos delegado.
   * @param {number} petId - ID de la mascota.
   * @param {string} action - Acción a realizar ('info', 'favorite').
   */
  function handlePetAction(petId, action) {
    const pet = [...petsDatabase.dogs, ...petsDatabase.cats].find(p => p.id === petId);
    if (!pet) return;
    
    switch(action) {
      case 'info':
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          addMessage(`Aquí tienes más detalles sobre ${pet.name}:<br>Raza: ${pet.breed}<br>Edad: ${pet.age}<br>Tamaño: ${pet.size}<br>${pet.description}`, 'bot', true);
          addMessage(`¿Qué más te gustaría hacer con ${pet.name} o con otras mascotas?`, 'bot', false, ["Agendar visita", "Agregar a favoritos", "Ver más mascotas", "Volver al menú principal"]);
        }, 1000);
        break;
        
      case 'favorite':
        if (!state.favoritePets.some(p => p.id === petId)) {
          state.favoritePets.push(pet);
          localStorage.setItem('pawfriend_favorites', JSON.stringify(state.favoritePets));
          showNotification(`❤️ ${pet.name} ha sido añadido a tus favoritos.`, 'success');
        } else {
          showNotification(`${pet.name} ya está en tus favoritos.`, 'info');
        }
        addMessage(`¿Hay algo más en lo que pueda ayudarte?`, 'bot', false, knowledgeBase.greeting.options); // Ofrecer opciones principales
        break;
    }
    saveConversationHistory();
  }

  // ==================== CALCULADORA DE COMIDA ====================
  function calculateFood() {
    const petType = document.getElementById('pet-type').value;
    const petWeight = parseFloat(document.getElementById('pet-weight').value);
    const petAge = document.getElementById('pet-age').value;
    const activityLevel = document.getElementById('activity-level').value;

    if (!petType || isNaN(petWeight) || petWeight <= 0 || !petAge || !activityLevel) {
      showNotification('Por favor, completa todos los campos con valores válidos para calcular la comida.', 'warning');
      return;
    }

    let dailyCalories = 0;
    let recommendationText = "";
    let feedingTips = "";

    // Valores de referencia (ejemplo, ajustar según datos reales)
    const baseCaloriesPerKg = {
      dog: { baby: 90, young: 70, adult: 60, senior: 50 },
      cat: { baby: 100, young: 80, adult: 70, senior: 60 },
      rabbit: { baby: 60, young: 50, adult: 40, senior: 30 },
      bird: { baby: 120, young: 100, adult: 90, senior: 80 }
    };

    if (baseCaloriesPerKg[petType] && baseCaloriesPerKg[petType][petAge]) {
      dailyCalories = petWeight * baseCaloriesPerKg[petType][petAge];

      // Ajustar por nivel de actividad
      if (activityLevel === 'high') dailyCalories *= 1.2;
      else if (activityLevel === 'low') dailyCalories *= 0.8;

      recommendationText = `Tu ${petType} (${petWeight} kg, ${petAge}, ${activityLevel}) necesita aproximadamente ${dailyCalories.toFixed(0)} kcal al día.`;

      switch (petType) {
        case 'dog':
          feedingTips = "Divide la ración en 2-3 comidas al día. Asegúrate de que siempre tenga agua fresca.";
          break;
        case 'cat':
          feedingTips = "Los gatos prefieren comer varias veces en pequeñas cantidades. Considera un dispensador.";
          break;
        case 'rabbit':
          feedingTips = "La dieta de un conejo debe ser principalmente heno, con verduras frescas y un poco de pienso.";
          break;
        case 'bird':
          feedingTips = "Ofrece una variedad de semillas, frutas, verduras y pellets específicos para aves.";
          break;
      }
    } else {
      recommendationText = "No puedo calcular la recomendación para este tipo de mascota o combinación de edad/peso.";
    }

    document.getElementById('recommendation').textContent = recommendationText;
    document.getElementById('feeding-tips').textContent = feedingTips;
    elements.foodResult.classList.remove('hidden');
    showNotification('Cálculo de comida completado.', 'success');
  }

  // ==================== NOTIFICACIONES ====================
  /**
   * Muestra una notificación temporal.
   * @param {string} message - El mensaje de la notificación.
   * @param {string} type - Tipo de notificación ('info', 'success', 'warning', 'danger').
   */
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('chatbot-notification', type);
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      notification.addEventListener('transitionend', () => notification.remove());
    }, 3000);
  }

  /**
   * Simula nuevas notificaciones y actualiza el badge.
   */
  function startNotificationInterval() {
    // Solo iniciar si no hay un intervalo ya corriendo y el chat no está abierto
    if (!state.notificationInterval && !state.isOpen) {
      state.notificationInterval = setInterval(() => {
        if (!state.isOpen) {
          state.unreadMessages++;
          checkUnreadMessages();
          showNotification(`Tienes ${state.unreadMessages} mensaje(s) nuevo(s) en el chatbot.`, 'info');
        } else {
          // Si el chat se abre, detener el intervalo
          clearInterval(state.notificationInterval);
          state.notificationInterval = null;
        }
      }, 30000); // Cada 30 segundos
    }
  }

  function checkUnreadMessages() {
    if (state.unreadMessages > 0) {
      elements.notificationBadge.textContent = state.unreadMessages;
      elements.notificationBadge.classList.remove('hidden');
    } else {
      elements.notificationBadge.classList.add('hidden');
    }
  }

  // Inicializar el chatbot al cargar la página
  init();
});
