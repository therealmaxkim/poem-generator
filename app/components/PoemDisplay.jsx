const React = require("react");

module.exports = function(props) {
    const [poem, setPoem] = React.useState([]);

    React.useEffect(() => {
        fetch("/poem")
            .then(result => result.json())
            .then(lines => setPoem(lines));
    }, []);

    //Octet of ABBAABBA and sestet of CDECDE
    const lineIndex = ["A", "B", "B", "A", "A", "B", "B", "A", "C", "D", "E", "C", "D", "E"];

    const lineElts = poem.map((line, i) => <div class={lineIndex[i]}>{line}</div>);

    return (
        <div class="front">{lineElts}</div>
    );
}