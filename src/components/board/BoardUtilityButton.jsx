import { StyleSheet, View, TouchableOpacity, Text, Platform } from "react-native";
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import { getContrastingFolderColor, getContrastingTextColor } from "../../partials/accessibility";
// import FAIcon from 'react-native-vector-icons/FontAwesome'; // Uncomment if using FAIcon
import { Image } from "expo-image";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './BoardUtilityButton.css'; // Ensure this CSS file exists and is relevant
import { useState, useRef, useEffect } from 'react';

// --- NEW IMPORTS ---
import { synthesize } from "../../partials/synthesis"; // Adjust path if necessary
import useSettings from "../../state/hooks/useSettings"; // Hook to get voice/speed/pitch settings

// --- PHONETIC MAP ---
// Map keys to the sound string/representation your synthesize function expects
const irishPhoneticMap = {
    // Consonants (Ensure these values work with your synthesize function)
    'b': '/bu/', 'bh': '/vu/',
    'c': '/kuh/', 'ch': '/khuh/',
    'd': '/du/', 'dh': '/ɣuh/',
    'f': '/fu/',
    'g': '/guh/', 'gh': '/ɣuh/', // Check pronunciation of gh
    'h': '/huh/',
    'l': '/lu/',
    'm': '/mu/', 'mh': '/vu/', // mh can also be /w/
    'n': '/nu/', 'ng': '/ŋ/', // Keep original '/ŋ/' if it works
    'p': '/puh/', 'ph': '/f/',
    'r': '/ruh/', // Rolled R sound
    's': '/suh/', 'sh': '/huh/',
    't': '/tuh/', 'th': '/hi/', // th is often /h/
    // Vowels (Ensure these IPA/formats work)
    'a': '/ah/', 'á': '/aː/',
    'e': '/eh/', 'é': '/eː/', // é should be long 'e' like /eː/ - check '/aː/' mapping
    'i': 'hi', // Literal 'i' surrounded by spaces
    'í': 'hí', // Literal 'í' surrounded by spaces
    'o': '/oh/', 'ó': '/o:/',
    'u': '/uh/', 'ú': '/u:/',  // Use workaround like 'ooh' if '/u:/' doesn't work
    // Add uppercase versions if needed (e.g., 'Á': '/ahː/')
    // Add digraphs if they are single keys (e.g., 'ng': '/ŋ/')
};
// --- END PHONETIC MAP ---

/**
 * BoardUtilityButton component
 */
export default function BoardUtilityButton({ item, onKeyboardPress, onPluralPress, boardId, onKeyPress }) {
    const code = item.label.trim();
    const isWeb = Platform.OS === "web";
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [isShifted, setIsShifted] = useState(false);
    const [irishMode, setIrishMode] = useState(false);
    // const [keyboardPosition, setKeyboardPosition] = useState({ x: 0, y: 0 }); // Currently unused
    const [currentInput, setCurrentInput] = useState("");
    const keyboardRef = useRef(null);
    const keyboardInstance = useRef(null);

    // Get settings for synthesis
    const { settings } = useSettings();

    const layoutName = irishMode
        ? (isShifted ? 'irishShift' : 'irish')
        : (isShifted ? 'shift' : 'default');

    // onChange handler for react-simple-keyboard visual update
    const onChange = (input) => {
        setCurrentInput(input);
        // Note: We are now primarily using setInput in processKeyPress,
        // but onChange is still useful for simple-keyboard's internal updates.
    };

    const handleShift = () => setIsShifted(prev => !prev);
    const handleIrishMode = () => setIrishMode(prev => !prev);

    // --- UNIFIED KEY PRESS PROCESSING LOGIC ---
    const processKeyPress = (button) => {
        console.log("Processing Key Press:", button, "Irish Mode:", irishMode);

        // --- Explicit Handling for Functional Keys ---
        if (button === "{shift}") {
            handleShift();
            return;
        }
        if (button === "{irish}") {
            handleIrishMode();
            return;
        }
        if (button === "{enter}") {
            if (currentInput.trim()) {
                onKeyPress(currentInput.trim()); // Call parent handler with finished input
                setCurrentInput("");             // Clear local state
                keyboardInstance.current?.clearInput(); // Clear keyboard's visual input
            }
            if (isShifted) { handleShift(); } // Turn off shift after enter
            return;
        }
        if (button === "{spás}") {
            const newInput = currentInput + " ";
            setCurrentInput(newInput);
            keyboardInstance.current?.setInput(newInput);
            if (isShifted) { handleShift(); }
            return;
        }
        if (button === "{bksp}") {
            const newInput = currentInput.slice(0, -1);
            setCurrentInput(newInput);
            keyboardInstance.current?.setInput(newInput);
            if (isShifted) { handleShift(); }
            return;
        }

        // --- PHONETIC SOUND LOGIC ---
        if (irishMode && irishPhoneticMap[button] && settings) {
            const soundToSpeak = irishPhoneticMap[button];
            console.log(`--- Phonetic logic entered for button: '${button}' ---`);
            console.log(`Value from map: '${soundToSpeak}'`);
            console.log(`Attempting synthesis with voice: ${settings?.voice}`);
            try {
                synthesize(
                    soundToSpeak,
                    settings.voice,
                    settings.speed,
                    settings.pitch
                );
                console.log(`--- Synthesis call apparently SUCCESSFUL for: '${soundToSpeak}' ---`);
            } catch (error) {
                console.error(`--- Error during synthesis for '${soundToSpeak}':`, error);
            }
            if (isShifted) { handleShift(); }
            // Current Assumption: Phonetic keys ONLY make sound and DO NOT add text.
            // If you want them to add text, remove the 'return' below.
            return;
        } else if (irishMode) {
             // Log if in Irish mode but key not found in map
             console.log(`--- Phonetic logic SKIPPED for '${button}' (Irish Mode: ${irishMode}, Has Key: ${!!irishPhoneticMap[button]}, Settings OK: ${!!settings}) ---`);
        }

        // --- Default Handling (Regular Characters) ---
        // Handles QWERTY keys, or Irish keys not in phonetic map,
        // or phonetic keys if the 'return' above is removed.
        console.log(`--- Default handling for character: '${button}' ---`);
        const newInput = currentInput + button;
        setCurrentInput(newInput);
        keyboardInstance.current?.setInput(newInput);

        // Auto turn-off shift after typing a character key
        if (isShifted) {
            handleShift();
        }
    };
    // --- END of unified key press processing logic ---


    // --- Physical keyboard handling ---
     const handleKeyDown = (event) => {
         // Add initial check log
         // console.log("handleKeyDown triggered, Key:", event.key, "showKeyboard:", showKeyboard);

         if (isWeb && keyboardInstance.current && showKeyboard) {
             // Prevent default for keys we handle
             const shouldPreventDefault = [ /* List of keys */
                 " ", "Enter", "Backspace", "Shift", "á", "é", "í", "ó", "ú", "Á", "É", "Í", "Ó", "Ú", ",", ".", "!", "?", "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0"
             ].includes(event.key);

             if (shouldPreventDefault) {
                 event.preventDefault();
             }

             // Ignore modifiers like Ctrl, Alt, Meta. Handle Shift separately if needed.
             if (["Control", "Alt", "Meta"].includes(event.key)) {
                 return;
             }
             // Basic Shift handling (might need refinement based on desired interaction)
             if (event.key === "Shift") {
                 // Toggle virtual shift only if physical shift is pressed down?
                 // Or maybe handleShift() directly? Needs careful thought.
                 // For now, just returning as simple-keyboard visual handles its own shift state.
                 return;
             }


             let button = '';
             // Map physical keys to virtual keyboard button identifiers
             switch (event.key) {
                 // Map fadas explicitly
                 case "á": button = "á"; break; case "Á": button = "Á"; break;
                 case "é": button = "é"; break; case "É": button = "É"; break;
                 case "í": button = "í"; break; case "Í": button = "Í"; break;
                 case "ó": button = "ó"; break; case "Ó": button = "Ó"; break;
                 case "ú": button = "ú"; break; case "Ú": button = "Ú"; break;
                 // Map functional keys
                 case " ": button = "{spás}"; break;
                 case "Enter": button = "{enter}"; break;
                 case "Backspace": button = "{bksp}"; break;
                  // Map punctuation/symbols
                 case ",": button = ","; break;
                 case ".": button = "."; break;
                 case "!": button = "!"; break;
                 case "?": button = "?"; break;
                 // Map letters and numbers (check against current layout)
                 default:
                    const currentLayoutKeys = keyboardInstance.current?.options.layout[layoutName]?.flatMap(row => row.split(' ')) || [];
                    // Prioritize exact match (respect case from physical keyboard if possible)
                    if (currentLayoutKeys.includes(event.key)) {
                         button = event.key;
                    } else {
                        // Fallback to lowercase if exact case not found (e.g., physical shift off but layout is shifted)
                        const keyLower = event.key.toLowerCase();
                        if (currentLayoutKeys.includes(keyLower)) {
                             button = keyLower;
                        } else {
                             // Fallback to uppercase if lowercase not found (less common)
                             const keyUpper = event.key.toUpperCase();
                             if (currentLayoutKeys.includes(keyUpper)){
                                  button = keyUpper;
                             }
                        }
                    }
                    // If still no match, button remains ''
                    break;
             }

             if (button) {
                 console.log("Physical Key Mapped:", button, "Calling processKeyPress...");
                 // --- Call the unified processing function directly ---
                 processKeyPress(button);
             } else {
                  console.log("Ignoring or cannot map physical key:", event.key);
             }
         }
     };


    // Effect for physical keyboard listener
    useEffect(() => {
        if (showKeyboard && isWeb) {
            window.addEventListener('keydown', handleKeyDown);
            console.log("Physical Keydown listener added");
        } else {
            window.removeEventListener('keydown', handleKeyDown);
            console.log("Physical Keydown listener removed");
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            console.log("Physical Keydown listener removed on cleanup");
        };
    }, [showKeyboard, isWeb, layoutName, currentInput, isShifted, irishMode, settings]); // Added dependencies


    // --- Component Rendering ---
    switch (code) {
        case "<% KEYBOARD>": {
            return (
                !isWeb ?
                <UtilityButton
                    onPress={onKeyboardPress} // Native keyboard action
                    boardId={boardId}
                    label={item.hide_label ? null : "méarchlár"}
                    image={item.image}
                    borderColor={item["border_color"]}
                    backgroundColor={item["background_color"]}
                /> :
                // Web version with react-simple-keyboard
                <View>
                    <UtilityButton
                        onPress={() => setShowKeyboard(prev => !prev)} // Toggle web keyboard visibility
                        boardId={boardId}
                        label={item.hide_label ? null : (showKeyboard ? "Folaigh Méarchlár" : "Méarchlár")}
                        image={item.image}
                        borderColor={"#D8DAE0"} // Example colors
                        backgroundColor={"#E0DED8"}
                    />
                    {showKeyboard && createPortal(
                        <Draggable handle=".drag-handle" defaultPosition={{ x: window.innerWidth/2 - 400, y: window.innerHeight/2 - 200 }}>
                            <div className="keyboard-container" ref={keyboardRef}>
                                <div className="drag-handle">
                                    <div className="close-button" onClick={() => setShowKeyboard(false)}>
                                        X
                                    </div>
                                </div>
                                <div className="keyboard-input">{currentInput || " "}</div>
                                <div className="keyboard-wrapper">
                                    <Keyboard
                                        keyboardRef={r => (keyboardInstance.current = r)}
                                        className="simple-keyboard"
                                        layout={{
                                            default: [
                                                "á é í ó ú {irish}", "1 2 3 4 5 6 7 8 9 0", "q w e r t y u i o p",
                                                "a s d f g h j k l {bksp}", "{shift} z x c v b n m {enter}", ", . ! ?", "{spás}",
                                            ],
                                            shift: [
                                                 "Á É Í Ó Ú {irish}", "1 2 3 4 5 6 7 8 9 0", "Q W E R T Y U I O P",
                                                 "A S D F G H J K L {bksp}", "{shift} Z X C V B N M {enter}", ", . ! ?", "{spás}",
                                            ],
                                            irish: [ 
                                                "ch sh bh dh gh th mh {irish}",
                                                "a e i o u",
                                                "á é í ó ú",
                                                "b l m n p r s t {bksp}",
                                                "c d g h f {enter}", 
                                                "{spás}",
                                            ],
                                        }}
                                        display={{ 
                                            "{enter}": "⮐ Ionchur", "{bksp}": "⌫ Scrios", "{shift}": "⇧ Athrú",
                                            "{irish}": irishMode ? "Qwerty" : "Phonetic", "{spás}": "Spás"
                                        }}
                                        buttonTheme={[ 
                                            { class: "special-key", buttons: "{irish}" },
                                            { class: "wide-button", buttons: "{spás}" },
                                            { class: "action-button", buttons: "{enter} {bksp}" }
                                        ]}
                                        layoutName={layoutName}
                                        
                                        onChange={onChange}
                                        
                                        onKeyPress={processKeyPress}
                                        theme="hg-theme-default hg-layout-default myTheme"
                                        physicalKeyboardHighlight={true}
                                        physicalKeyboardHighlightTextColor="#2c5530"
                                        physicalKeyboardHighlightBgColor="#e8f4ea"
                                        syncInstanceInputs={true}
                                    />
                                </div>
                            </div>
                        </Draggable>
                    , document.body)}
                </View>
            )
        }
        // Handle other utility button types if necessary
        default: {
            return null;
        }
    }
}

// UtilityButton Component (Renders the toggle button on the main grid)
function UtilityButton({ onPress, boardId, label, image, borderColor, backgroundColor }) {
    const API_LINK = process.env.EXPO_PUBLIC_GEABAIRE_API_LINK ?? "https://api.geabaire.abair.ie/v1/";

    const imageLink = image ? `${API_LINK}/images/${boardId}/${image}.webp` : null;
    const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['; // Example blurhash
    const computedStyle = {
        backgroundColor: backgroundColor,
        borderColor: borderColor,
    };

    const labelColor = {
        color: getContrastingTextColor(backgroundColor)
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            // Use the StyleSheet definition below
            style={[styles.container, computedStyle]}
        >
            {label && (
                <Text style={[styles.labelStyle, labelColor]}>{label}</Text>
            )}
            {imageLink && (
                <Image
                    source={{ uri: imageLink }}
                    style={styles.imageStyle}
                    placeholder={{ blurhash }}
                    contentFit="contain"
                    transition={100}
                    cachePolicy={"memory-disk"}
                />
            )}
        </TouchableOpacity>
    )
}

// Styles for UtilityButton (the toggle button on the main grid)
const styles = StyleSheet.create({
    container: { // Styles the TouchableOpacity wrapping UtilityButton
        margin: 8, // Keep margin? Or let grid handle spacing? Test removal if needed.
        // minHeight: 60, // Removed as requested
        // width: 100, // Removed previously
        borderRadius: 12,
        borderColor: "rgba(12, 12, 12, 0.3)",
        borderWidth: 2,
        alignItems: "center", // Center content horizontally
        justifyContent: "center", // Center content vertically (if flex: 1 is active)
        paddingVertical: 5,
        paddingHorizontal: 2,
        overflow: 'hidden',
        flex: 1, // Allow filling vertical space (if parent/grid cell allows)
        // Add background color if needed, or let it come from props
        // backgroundColor: '#f0f0f0', // Example background
    },
    labelStyle: {
        textAlign: "center",
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    imageStyle: {
        width: 32,
        height: 32,
    },
    // topRightIcon style definition if needed
});