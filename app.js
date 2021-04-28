const app = {};
app.key = `RGAPI-7a7ab972-8c0f-4665-bdb0-b65051695a9f`;
app.summonerData;

// need to grab, game type= queueId, time played, win/lose = teams.1 or 0.win, game length, champion played, KDA, level, CS, kill participation, item bought, 10 ppl who played in that match and their champs

app.getDate = (query) => {
    let date = new Date();
    let nowDate = date.getTime();
    console.log(nowDate);
    let playedTimeStamp = nowDate - query.gameCreation;
    console.log(query.gameCreation);
    console.log(playedTimeStamp);
    let playedTime = 0;
    if (playedTimeStamp <60000) {
        playedTime = 1;
        console.log("Match played less than a minute ago")
        return "Match played less than a minute ago";
    }
    else if (playedTimeStamp < 3600000) {
        playedTime = playedTimeStamp / 60000;
        console.log(`Match played ${Math.floor(playedTime)} minutes ago`);
        return `Match played ${Math.floor(playedTime)} minutes ago`;
    }
    else if (playedTimeStamp < 86400000) {
        playedTime = playedTimeStamp / 3600000;
        console.log(`Match played ${Math.floor(playedTime)} hours ago`);
        return `Match played ${Math.floor(playedTime)} hours ago`;
    }
    else {
        playedTime = playedTimeStamp /86400000;
        console.log (`Match played ${Math.floor(playedTime)} days ago`);
        return `Match played ${Math.floor(playedTime)} days ago`;
    }
}
app.getAccountId = async function(search) {
     let account = await $.ajax({
        url: 'https://proxy.hackeryou.com',
        dataType: 'json',
        method:'GET',
        data: {
        reqUrl: `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${search}?api_key=${app.key}&method=GET&dataType=json`
        }
    })


        console.log(account)
        app.getRankedInfo(account.id);
        console.log(account.summonerLevel);
        app.displayAccountInfo(account);
        app.getMatch(account.accountId);


    
}
app.getRankedInfo = async function(summonerId) {
     let rankedInfo = await $.ajax({
        url: 'https://proxy.hackeryou.com',
        dataType: 'json',
        method:'GET',
        data: {
        reqUrl: `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${app.key}&method=GET&dataType=json` }
    })
    

        console.log(rankedInfo);

        let tier = rankedInfo[0].tier
        let rank = rankedInfo[0].rank
        let rankNum = 0;
        switch (rank) {
            case "I":
                rankNum = 1;
            break;
            case "II":
                rankNum = 2;
                break;
            case "III":
                rankNum = 3;
                break;
            case "IV":
                rankNum = 4;
                break;
        }


    
        let rankedInfoHtml = `<div class = "ranked">
        <p>rank: ${rankedInfo[0].tier} ${rankedInfo[0].rank} ${rankedInfo[0].leaguePoints} lp</p>
        <img class = "rank" src = https://opgg-static.akamaized.net/images/medals/${tier}_${rankNum}.png?image=q_auto:best&amp;v=1>
        <p>win rate: ${rankedInfo[0].wins} wins / ${rankedInfo[0].losses} losses - ${Math.floor((rankedInfo[0].wins / (rankedInfo[0].wins + rankedInfo[0].losses)) * 100)}% win rate </p>
        </div>
        <div class = "good">
        </div>
        `
        $('.rankedInfo').append(rankedInfoHtml);
        console.log(rankedInfo[0].tier);
    
}

app.getMatch = async function (account){
    let match = await $.ajax({
        url: 'https://proxy.hackeryou.com',
        dataType: 'json',
        method:'GET',
        data: {
        reqUrl: `https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${account}?api_key=${app.key}&method=GET&dataType=json`
        }
    })

        console.log(match);
        const matchArray = [];
        for (let i = 0; i < 10 ; i++) {
        matchArray.push(match.matches[i].gameId);
        }
        console.log(matchArray);
        for (let i = 0; i < 10 ; i++) {
            app.getMatchDetail(matchArray[i], i, account);
            }  
    }
    app.displayAccountInfo = function (res) {
        const accountInfoHtml = `<div class = "account">
        <p>Level: ${res.summonerLevel}</p>
        </div>
        <div class = "good">
        </div>
        `
        $('.accountInfo').append(accountInfoHtml);
    }

    app.displayMatchInfo = async function (res, gameNum, account) {
        const champArray = []
        // need to grab, game type= queueId, time played, win/lose = teams.1 or 0.win, game length, champion played, KDA, level, CS, kill participation, item bought, 10 ppl who played in that match and their champs

        console.log(res);

        let myChamp;

        for (let i = 0 ; i < 10 ; i++){
            let summonerName = res.participantIdentities[i].player.summonerName;
            

            if (i < 5) {
                champArray.push(await app.convertChamps(res, i));
                    const championHtml = ` <div class = "player">
                    <img src="https://opgg-static.akamaized.net/images/lol/champion/${champArray[i]}.png?image=c_scale,q_auto,w_46&amp;v=1612855207" alt="${champArray[i]}">
                    <a href="#" onclick="app.reSearch(this.innerHTML)" class = "playerName">${summonerName}</a>
                    </div>
                    `

            $(".blueTeam" + gameNum).append(championHtml);
            }

            else {
                champArray.push(await app.convertChamps(res, i));
                    const championHtml = `<div class = "player">
                    <img src="https://opgg-static.akamaized.net/images/lol/champion/${champArray[i]}.png?image=c_scale,q_auto,w_46&amp;v=1612855207" alt="${champArray[i]}">
                    <a href="#" onclick="app.reSearch(this.innerHTML)" class = "playerName">${summonerName}</a>
                    </div>
                    `
            $('.redTeam' + gameNum).append(championHtml);


            }

            if (res.participantIdentities[i].player.accountId == account){
                myChamp = res.participants[i].championId;
            }


    }

let myChampName = await app.myChamp(myChamp); 



    $('.game' + gameNum).append(`<div class="erased">${app.getDate(res)}</div>`);
    $('.game' + gameNum).append(`<div class="myChampion erased"><img src="https://opgg-static.akamaized.net/images/lol/champion/${myChampName}.png?image=c_scale,q_auto,w_46&amp;v=1612855207" class ="myChamp" alt="${myChampName}"></img>played</div>`);
    // $('.game' + gameNum).append(res.participants[]);



    }

    app.getMatchDetail = async function (match, gameNum, account) {
        const matchDetail = await $.ajax({
            url: 'https://proxy.hackeryou.com',
            dataType: 'json',
            method:'GET',
            data: {
            reqUrl: `https://na1.api.riotgames.com/lol/match/v4/matches/${match}?api_key=${app.key}&method=GET&dataType=json`
            }
        })
        
            app.displayMatchInfo(matchDetail, gameNum, account);

}
    app.convertChamps = async function (res, res2) {
        console.log(res.participants[res2].championId);
        const championInfo = await $.ajax({
            url: `https://ddragon.leagueoflegends.com/cdn/11.4.1/data/en_US/champion.json`,
            method: `GET`,
            dataType: `Json`
        });
        const championArray = Object.keys(championInfo.data);

        let championName = "ashe";
            for(let i = 0 ; i <championArray.length ; i++){
                if (championInfo.data[championArray[i]].key == res.participants[res2].championId){
                    championName = championArray[i];
                }
            }
            return championName;
}
    app.myChamp = async function (res) {
        const championInfo = await $.ajax({
            url: `https://ddragon.leagueoflegends.com/cdn/11.4.1/data/en_US/champion.json`,
            method: `GET`,
            dataType: `Json`
        });

        const championArray = Object.keys(championInfo.data);
        let championName = "ashe";
            for(let i = 0 ; i <championArray.length ; i++){
                if (championInfo.data[championArray[i]].key == res){
                    championName = championArray[i];
                }
            }
            return championName;

    }

    app.reSearch = (query) => {
        // summonerName = document.getElementById("summonerSearch").innerHTML;
        // console.log(summonerName);
        console.log(query);
        $(".erased").empty();
        $(".account").empty();
        $(".ranked").empty();
        $(".blue").empty();
        $(".red").empty();
        app.getAccountId(query);
    }

    app.getChampion = (query) => {
        $.ajax({
            url: `https://ddragon.leagueoflegends.com/cdn/11.4.1/data/en_US/champion.json`,
            method: `GET`,
            dataType: `Json`
        }).then((res)=> {
            app.displayMatchInfo(app.convertChamps(res));
        });
    }

    app.applyCSS = () => {
        
        const matches = document.querySelectorAll('.game');
        matches.forEach((query)=> {
            query.style.border='2px solid white';
        })
        
        
        // document.querySelector('.game').style.border='2px solid white';
        // console.log(document.querySelectorAll('.game'));
    }

app.init = () => {
    

    $('form').on('submit', function(e) {
                e.preventDefault();
                const searchName = $('input').val();
                app.getAccountId(searchName).then(()=>{
                    app.applyCSS();
                })
                
    });
}
$(function (){
//document ready!
    app.init();
});