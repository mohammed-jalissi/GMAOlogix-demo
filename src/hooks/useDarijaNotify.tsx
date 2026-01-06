import { useNotification, NotificationType } from '../contexts/NotificationContext';

export const DARIJA_DICTIONARY = {
    // Actions générales
    success_generic: "Lah y3tik se77a, dakchy daz mzyan!",
    error_generic: "Oups, kayn chi mochkil, 3awed jareb men ba3d.",
    warning_generic: "Roud balek, kayn chi 7aja machi hiya hadik.",
    info_generic: "Ha wa7ed lma3louma mouhima.",

    // Actions spécifiques (CRUD)
    create_success: "Tzad bnadjah! Lah yskher.",
    update_success: "Tbedlat lma3loumat mzyan.",
    delete_success: "Tms7at mzyan.",

    // Modules spécifiques
    demande_envoyee: "Talab d l'intervention tssajal bnadjah.",
    demande_approuvee: "Talab t'accepta, l'équipe ghadi tbda lkhdma.",
    demande_rejetee: "Talab trfed.",
    plan_maintenance_cree: "L'plan d'maintenance tzad bnadjah.",
    equipement_cree: "L'équpement tzad f'lsystème mzyan.",
    stock_entree_success: "L'stock tzad bnadjah!",
    piece_creee_success: "l'pièce tzad f'lsystème mzyan.",

    // Auth
    login_success: "Merhba bik! Dkhol mzyan.",
    logout_success: "Thalla, nchoufouk mara khra inchallah.",

    // Help Messages (Explications)
    help_add_piece: "Hna tqdr tzid pièce jdida l'stock dyalk. 3mmar ga3 lma3loumat bach ybqa kolchi mnaddem.",
    help_entry_stock: "Hna bach tdekhel sel3a jdida jat men 3nd l'fournisseur. Zid lquantité li wslatek.",
    help_filter_stock: "Rtteb o qelleb 3la lpièce li baghi bshoula (b'smia, code, ola stock critique).",
    help_add_fournisseur: "Zid fournisseur jdid l'liste dyalk bach tbqa tbe3 m3ah lcmds.",
    help_view_catalog: "Chouf ga3 les pièces li kaybi3 had lfournisseur m3a taman o lstock.",
    help_create_ot: "Sayeb ordre de travail jdid l'technicien. Hded lmochkil o chkoun ghadi ysaleh.",
    help_export_pdf: "Kharraj hadchi f'werqa PDF bach tqdr tbe3ha ola tsiftha.",
    help_add_equipment: "Zid machine jdida l'parc dyalk. Matnsach tzid la date d'achat.",
    help_create_pmp: "Sayeb plan d'maintenance préventive bach tfecca lmachakil qbel ma ywq3ou.",
};

export const DARIJA_TTS_DICTIONARY = {
    // Actions générales
    success_generic: "الله يعطيك الصحة، داكشي داز مزيان!",
    error_generic: "أوبس، كاين شي مشكل، عاود جرب من بعد.",
    warning_generic: "رد بالك، كاين شي حاجة ماشي هي هاديك.",
    info_generic: "ها واحد المعلومة مهمة.",

    // Actions spécifiques (CRUD)
    create_success: "تزاد بنجاح! الله يسخر.",
    update_success: "تبدلات المعلومات مزيان.",
    delete_success: "تمسحات مزيان.",

    // Modules spécifiques
    demande_envoyee: "طلب التدخل تسجل بنجاح.",
    demande_approuvee: "الطلب تقبل، الفريق غادي يبدا الخدمة.",
    demande_rejetee: "الطلب ترفض.",
    plan_maintenance_cree: "Plan de maintenance تزاد بنجاح.",
    equipement_cree: "المعِدّة تزادت ف السيستيم مزيان.",
    stock_entree_success: "الستوك تزاد بنجاح!",
    piece_creee_success: "البياسة تزادت ف السيستيم مزيان.",

    // Auth
    login_success: "مرحبا بيك! دخلتي مزيان.",
    logout_success: "تهلا، نشوفوك مرة خرة إن شاء الله.",

    // Help Messages (Explications)
    help_add_piece: "هنا تقدر تزيد بياسة جديدة للستوك ديالك. عمر ڭاع المعلومات باش يبقى كلشي منظم.",
    help_entry_stock: "هنا باش تدخل سلعة جديدة جات من عند الفورنيسور. زيد الكونتيتي لي وصلاتك.",
    help_filter_stock: "رتب وقلب على البياسة لي باغي بسهولة. بالسمية، كود، ولا ستوك كريطيك.",
    help_add_fournisseur: "زيد فورنيسور جديد لاليست ديالك باش تبقى تتبع معاه لي كوموند.",
    help_view_catalog: "شوف ڭاع لي بياس لي كيبيع هاد الفورنيسور مع التمن والستوك.",
    help_create_ot: "صايب أمر ديال الخدمة جديد للتقني. حدد المشكل وشكون غادي يصلح.",
    help_export_pdf: "خرج هادشي ف ورقة بي دي إف باش تقدر تطبعها ولا تصيفطها.",
    help_add_equipment: "زيد ماشين جديدة للبارك ديالك. ماتنساش تزيد تاريخ الشراء.",
    help_create_pmp: "صايب بلان د مينتونونس بريفونتيف باش تفادى المشاكل قبل ما يوقعو.",
};

export function useDarijaNotify() {
    const { addNotification } = useNotification();

    const notify = (key: keyof typeof DARIJA_DICTIONARY, type: NotificationType = 'success') => {
        const message = DARIJA_DICTIONARY[key] || DARIJA_DICTIONARY['success_generic'];
        addNotification(message, type);
    };

    return { notify, dictionary: DARIJA_DICTIONARY, ttsDictionary: DARIJA_TTS_DICTIONARY };
}
