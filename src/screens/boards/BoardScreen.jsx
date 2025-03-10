import { StyleSheet } from "react-native"
import useBoard from "../../state/hooks/useBoard"
import { useRecoilValue } from "recoil";
import { settingsState } from "../../state/atoms/settings";
import { useEffect, useMemo, useRef, useState } from "react";
import BoardControls from "../../components/board/BoardControls";
import useSentence from "../../state/hooks/useSentence";
import FlatGrid from "../../components/structures/FlatGrid";
import BoardButton from "../../components/board/BoardButton";
import BoardSideControls from "../../components/board/BoardSideControls";
import { View } from "react-native";
import BoardButtonEmpty from "../../components/board/BoardButtonEmpty";
import BoardUtilityButton from "../../components/board/BoardUtilityButton";
import { getPluralOf } from "../../partials/plurals";
import useSettings from "../../state/hooks/useSettings";

export default function BoardScreen({ navigation, route: { params: { boardId } } }) {
    // Retrieve board data and functions from custom hook
    const { board, push } = useBoard(boardId);
    // Retrieve sentence state and functions from custom hook
    const { addButtonPress, sentence, lastWord, cutOffLastWord } = useSentence();
    // Retrieve settings state and update function from custom hook
    const {settings, updateSetting} = useSettings();
    // Function to set whether to show images in the home bar
    const setShowImagesInHomebar = (value) => updateSetting("doShowImagesInHomeBar", value);
    // Reference to the text input bar
    const textBarInputRef = useRef(null);
    // State for keyboard input
    const [keyboardInput, setKeyboardInput] = useState("");

    // Memoised components for performance optimisation
    const boardControls = useMemo(() => <BoardControls navigation={navigation} textBarInputRef={textBarInputRef}/>, [navigation]);
    const boardSideControls = useMemo(() => <BoardSideControls style={styles.sidebar} sentence={sentence} navigation={navigation}/>, [sentence, navigation]);

    // Determine the image ID based on settings
    const otherImageId = settings.internal?.imagesid;

    // Memoised grid component with buttons
    const boardGrid = useMemo(() => {
        if (!board || !board.buttons) return;
        return <FlatGrid
            data={board.buttons}
            numColumns={board.grid.columns}
            numRows={board.grid.rows}
            rowStyle={styles.row}
            columnStyle={styles.column}
            renderItem={({ item }) => {
                if (item === null) return <BoardButtonEmpty/>
                if (item.label.startsWith("<%")) return (
                    <BoardUtilityButton
                        item={item}
                        onKeyboardPress={onKeyboardPress}
                        onPluralPress={onPluralPress}
                        boardId={otherImageId ?? boardId}
                        onKeyPress={handleKeyPress}
                    />
                )

                return (
                    <BoardButton
                        item={item}
                        addButtonPress={addButtonPress}
                        openFolder={push}
                        boardId={otherImageId ?? boardId}
                    />
                )
            }}
        />
    }, [board, sentence, keyboardInput]);

    // Function to handle plural press
    async function test() {
        getPluralOf("fear")
    }

    // Effect hook to test plural function on mount
    useEffect(() => {test()}, [])

    // Function to handle keyboard press
    function onKeyboardPress() {
        // Switch to text bar in settings if not already
        if (settings.doShowImagesInHomeBar) {
            setShowImagesInHomebar(false);
        }

        // Focus text bar input
        if (textBarInputRef.current) {
            textBarInputRef.current.focus();
        }
    }

    function handleKeyPress(input) {
        // When Enter is pressed, we receive the complete input string
        if (input && typeof input === 'string') {
            addButtonPress({ label: input });
            setKeyboardInput(""); // Clear the input after adding to sentence
        }
    }

    async function onPluralPress() {
        // console.log(sentence)
        // const words = sentence.split(" ");

        // if (words.length === 0) return;
        // const lastWord = words[words.length - 1];
        console.log(lastWord)

        const plural = await getPluralOf(lastWord);
        if (plural == null) return;

        const {imageLink, label} = cutOffLastWord();
        addButtonPress({imageLink, label: plural});

    }

    return (
        <>
            {boardControls}
            <View style={styles.container}>
                {boardGrid}
                {boardSideControls}
            </View>
        </>
    )
}

// Stylesheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 8
    },
    row: {
        marginTop: 8,
        marginBottom: 8
    },
    controlButtonContainer: {
        padding: 24,
        margin: 2,
        borderRadius: 12,
        borderColor: "rgba(12, 12, 12, 0.3)",
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    cblabelStyle: {
        fontSize: 16,
        paddingBottom: 10,
        textAlign: "center",
    },
    sidebar: {
        backgroundColor: "#E2E2E2",
        justifyContent: "flex-end",
        borderLeftColor: "#CCCCCC",
        borderLeftWidth: 1,
        width: 10
    }
});
