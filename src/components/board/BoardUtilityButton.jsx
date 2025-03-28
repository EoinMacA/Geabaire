import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import { getContrastingFolderColor, getContrastingTextColor } from "../../partials/accessibility"
import FAIcon from 'react-native-vector-icons/FontAwesome';
import { Image } from "expo-image";
import { Platform } from "react-native";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './BoardUtilityButton.css';
import { useState, useRef, useEffect } from 'react';

/**
 * BoardUtilityButton renders a utility button based on the item passed.
 * 
 * @param {Object} props - The properties object.
 * @param {Object} props.item - The utility button item data.
 * @param {Function} props.onKeyboardPress - The function to execute on keyboard press.
 * @param {Function} props.onPluralPress - The function to execute on plural press.
 * @param {string} props.boardId - The ID of the board.
 * @returns {JSX.Element} A TouchableOpacity component representing the utility button.
 */
export default function BoardUtilityButton({ item, onKeyboardPress, onPluralPress, boardId, onKeyPress }) {
    const code = item.label.trim()
    const isWeb = Platform.OS === "web";
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [layoutName, setLayoutName] = useState("default");
    const [keyboardPosition, setKeyboardPosition] = useState({ x: 0, y: 0 });
    const [currentInput, setCurrentInput] = useState("");
    const keyboardRef = useRef(null);
    const keyboardInstance = useRef(null);

    const onChange = (input) => {
        console.log("Input changed", input);
        setCurrentInput(input); // Update currentInput here
      };

    const handleShift = () => {
        const newLayoutName = layoutName === "default" ? "shift" : "default";
        setLayoutName(newLayoutName);
    };

    let altGrPressed = false;

    const handleKeyDown = (event) => {
        if (isWeb && keyboardInstance.current) {
            event.preventDefault();
    
            // Handle Irish characters (for AltGr + vowel) and special characters
            let button = '';
            switch (event.key) {
                case "á": button = "á"; break;
                case "é": button = "é"; break;
                case "í": button = "í"; break;
                case "ó": button = "ó"; break;
                case "ú": button = "ú"; break;
                case " ": button = " "; break;
                case ",": button = ","; break;
                case ".": button = "."; break;
                case "!": button = "!"; break;
                case "?": button = "?"; break;
                case "Enter": button = "{enter}"; break; // Handle physical Enter key
            }
    
            if (button) {
                console.log("AltGr or Special Key:", button);
                keyboardInstance.current.handleButtonClicked(button);
                return;
            }
    
            // Handle normal keys and shift + special characters
            button = event.key;
            if (event.shiftKey && (event.key === "!" || event.key === "?")) {
                console.log("Shift + Special Key:", button);
                keyboardInstance.current.handleButtonClicked(button);
                return;
            }
    
            switch (event.key) {
                case "Control":
                    return;
                case "Shift":
                    button = "{shift}";
                    break;
                case "Backspace":
                    button = "{bksp}";
                    break;
                default:
                    if (!isKeyOnBoard(button)) return;
            }
    
            console.log("Normal Key:", button);
            keyboardInstance.current.handleButtonClicked(button);
        }
    };

    const isKeyOnBoard = (key) => {
        // Implement logic to check if the key is part of the physical keyboard layout
        const validKeys = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        return validKeys.includes(key.toLowerCase());
    };

    useEffect(() => {
        if (showKeyboard) {
            window.addEventListener('keydown', handleKeyDown);
            console.log("Keydown listener added"); // Add this line
        } else {
            window.removeEventListener('keydown', handleKeyDown);
            console.log("Keydown listener removed"); // Add this line
        }
    
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            console.log("Keydown listener removed on cleanup"); // Add this line
        };
    }, [showKeyboard]);

    switch (code) {
        case "<% KEYBOARD>": {
            return (
                !isWeb ?
                <UtilityButton
                    onPress={onKeyboardPress}
                    boardId={boardId}
                    label={item.hide_label ? null : "méarchlár"}
                    image={item.image}
                    borderColor={item["border_color"]}
                    backgroundColor={item["background_color"]}
                /> :
                <View>
                <UtilityButton
                    onPress={() => {
                        setShowKeyboard(prev => {
                            const newValue = !prev;
                            console.log("showKeyboard changed to:", newValue);
                            return newValue;
                        });
                    }}
                    boardId={boardId}
                    label={item.hide_label ? null : "méarchlár (ar fáil)"}
                    image={item.image}
                    borderColor={"#D8DAE0"}
                    backgroundColor={"#E0DED8"}
                />
                    {showKeyboard && createPortal(
                        <Draggable handle=".drag-handle" defaultPosition={{x: window.innerWidth/2 - 400, y: window.innerHeight/2 - 200}}>
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
                                                "á é í ó ú",
                                                "1 2 3 4 5 6 7 8 9 0",
                                                "q w e r t y u i o p",
                                                "a s d f g h j k l {bksp}",
                                                "{shift} z x c v b n m {enter}",
                                                ", . ! ?",
                                                "{spás}",
                                            ],
                                            shift: [
                                                "Á É Í Ó Ú",
                                                "1 2 3 4 5 6 7 8 9 0",
                                                "Q W E R T Y U I O P",
                                                "A S D F G H J K L {bksp}",
                                                "{shift} Z X C V B N M {enter}",
                                                ", . ! ?",
                                                "{spás}",
                                            ]
                                        }}
                                        buttonTheme={[{
                                            class: "special-key",
                                            buttons: "á é í ó ú Á É Í Ó Ú"
                                        }]}
                                        display={{
                                            "{enter}": "⮐",
                                            "{bksp}": "⌫",
                                            "{shift}": "⇧",
                                            "{spás}": "[______________________]"
                                        }}
                                        layoutName={layoutName}
                                        onChange={onChange}
                                        onKeyPress={(button) => {
                                            if (button === "{shift}") {
                                                handleShift();
                                                return;
                                            }
                                        
                                            if (button === "{enter}") {
                                                if (currentInput.trim()) {
                                                    onKeyPress(currentInput.trim());
                                                    setCurrentInput(""); // Clear the input state
                                                    keyboardInstance.current.setInput(""); // Clear the keyboard display
                                                }
                                                return;
                                            }
                                        
                                            setCurrentInput(prev => {
                                                if (button === "{bksp}") {
                                                    return prev.slice(0, -1);
                                                }
                                                if (button === "{spás}") {
                                                    return prev + " ";
                                                }
                                                return prev + button;
                                            });
                                        }}
                                        value={currentInput}
                                        theme="hg-theme-default hg-layout-default myTheme"
                                        physicalKeyboardHighlight={true}
                                        physicalKeyboardHighlightTextColor="#2c5530"
                                        physicalKeyboardHighlightBgColor="#e8f4ea"
                                    />
                                </div>
                            </div>
                        </Draggable>
                    , document.body)}
                </View>
            )
        }

        case "<% PLURAL>": {
            return (
                <UtilityButton
                    onPress={onPluralPress}
                    boardId={boardId}
                    label={item.hide_label ? null : "iolra"}
                    image={item.image}
                    borderColor={item["border_color"]}
                    backgroundColor={item["background_color"]}
                />
            )
        }
    }
}

/**
 * UtilityButton renders the utility button with a label and an optional image.
 * 
 * @param {Object} props - The properties object.
 * @param {Function} props.onPress - The function to execute on button press.
 * @param {string} props.boardId - The ID of the board.
 * @param {string} props.label - The label of the button.
 * @param {string} props.image - The image URI.
 * @param {string} props.borderColor - The border color of the button.
 * @param {string} props.backgroundColor - The background color of the button.
 * @returns {JSX.Element} A TouchableOpacity component representing the utility button.
 */
function UtilityButton({ onPress, boardId, label, image, borderColor, backgroundColor }) {
    const API_LINK = process.env.EXPO_PUBLIC_GEABAIRE_API_LINK ?? "https://api.geabaire.abair.ie/v1/"

    const imageLink = '${API_LINK}/images/${boardId}/${image}.webp'
    const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';
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
            style={[styles.container, computedStyle]}
        >
            {label && (
                <Text style={[styles.labelStyle, labelColor]} fontSize={11} >{label}</Text>
            )}
            {image && (
                <Image
                    source={imageLink}
                    style={styles.imageStyle}
                    placeholder={blurhash}
                    contentFit={"contain"}
                    cachePolicy={"memory-disk"}
                />
            )}

            <FAIcon
                type="fontawesome"
                name="cogs"
                style={styles.topRight}
                color={getContrastingFolderColor(backgroundColor)}
            />
        </TouchableOpacity>
    )
}

// Styles for the BoardUtilityButton and UtilityButton components
const styles = StyleSheet.create({
    container: {
        margin: 8,
        height: "100%",
        borderRadius: 12,
        borderColor: "rgba(12, 12, 12, 0.3)",
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 1
    },
    labelStyle: {
        color: "black",
        textAlign: "center",
        fontSize: 11
    },
    imageStyle: {
        width: 32,
        height: 32,
    },
    topRight: {
        position: "absolute",
        top: 0,
        right: 0,
        marginTop: 3,
        marginRight: 3,
    },
});