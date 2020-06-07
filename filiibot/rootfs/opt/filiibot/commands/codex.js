// If the command is 'codex'
case 'codex': {
    const searchResult = client.enmap.people.get(message.member.id, 'searchResult');

    if (searchResult.length === 0) {
    // args[0] = page
    log(`Ready to search for ${args.slice(2).join(' ')} in ${args[0].toLowerCase()}`);
    const searchUrl = `http://ec433c9f-filiicodex:3000/search/${args[0].toLowerCase()}/${args.slice(2).join(' ')}`;

    // Codex REST API
    axios.get(searchUrl)
        .then((response) => {
        log(response);
        log(response.data);
        // handle success
        client.enmap.people.set(message.member.id, response.data, 'searchResult');

        let bericht;
        bericht = 'Maak alstublieft een selectie:\n';

        let selection;
        for (selection = 0; selection < response.data.length; selection += 1) {
            bericht += `\n${selection}. ${response.data[selection].item.title}`;
        }

        message.reply(bericht);
        })
        .catch((error) => {
        // handle error
        log(`Error: ${error}`);
        });
    } else {
    log(`Selecting song ${args[0].toLowerCase()} of searchResult`);
    message.reply(searchResult[args[0].toLowerCase()].item.html.text);
    client.enmap.people.set(message.member.id, [], 'searchResult');
    log('Clearing searchResult');
    }
    /*
    message.reply(
    `je kan ${songPage[0].Title} vinden op https://studentencodex.org/lied/${
        songPage[0].FriendlyUrl
    }`,
    );
    */
    break;
}