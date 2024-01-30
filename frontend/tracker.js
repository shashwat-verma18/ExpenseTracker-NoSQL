const url = `http://localhost:4000`;

var leaderBoardStatus = false;

function addExpense(e) {

    e.preventDefault();

    var amount = document.getElementById('amt_inp').value;
    var des = document.getElementById('des').value;
    var cat = document.getElementById('cat-val').value;

    let obj = {
        amount,
        des,
        cat
    };

    let token = localStorage.getItem('token');

    axios.post(`${url}/expense/addExpense`, obj, { headers: { "Authorization": token } })
        .then(respond => {
            document.getElementById('myForm').reset();
            history.replaceState(null, null, document.URL);
            window.location.replace("./dashboard.html");
        })
        .catch(err => console.log(err));

}


window.addEventListener("DOMContentLoaded", () => {
    let token = localStorage.getItem('token');
    if (!token) {
        window.location.replace("./login.html");
    }

    let decodeToken = parseJwt(token);

    if (decodeToken.isPremium) {
        downloadHistory();
        showPremiumUser();
    }

    const page = 1;

    getExpenses(page);

    loadLeaderboard();
});

function getExpenses(page){
    let token = localStorage.getItem('token');
    let limit = localStorage.getItem('perPage');

    axios.get(`${url}/expense/getExpenses?page=${page}&perPage=${limit}`, { headers: { "Authorization": token } })
        .then((respond) => {

            if (respond.data.expenses.length === 0) {
                document.getElementById('dashMsg').innerHTML = 'No data found !';
            } else {

                document.getElementById('listExpenses').innerHTML='';
                
                document.getElementById('dashMsg').innerHTML = '';
                for (var i = 0; i < respond.data.expenses.length; i++) {
                    showExpense(respond.data.expenses[i]);
                }

                showPagination(respond.data);

            }
        })
        .catch(err => console.log(err));
}


function logOut() {
    localStorage.removeItem('token');
    history.replaceState(null, null, document.URL);
    window.location.replace("./login.html");
}

function deleteItem(e) {
    if (confirm('Are You Sure?')) {
        var li = e.target.parentElement;
        var liContent = li.textContent;
        const str = liContent.split("-");

        var key = str[3].trim();

        let token = localStorage.getItem('token');


        axios.post(`${url}/expense/deleteExpense/${key}`, {}, { headers: { "Authorization": token } })
            .then((response) => {
                var list = document.getElementById('listExpenses');
                list.removeChild(li);
            })
            .catch(errorMessage => {
                console.log(errorMessage);
            });

    }
}

function premium(e) {
    let token = localStorage.getItem('token');

    axios.get(`${url}/purchase/premiumMembership`, { headers: { "Authorization": token } })
        .then(respond => {

            var options = {
                "key": respond.data.key_id,
                "order_id": respond.data.order.id,
                "handler": async function (respond) {
                    await axios.post(`${url}/purchase/updateTransactionStatus`, {
                        order_id: options.order_id,
                        payment_id: respond.razorpay_payment_id,
                        check: true
                    }, { headers: { "Authorization": token } });


                    alert('You are a Premium User Now');

                    showPremiumUser();
                },
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();
            e.preventDefault();

            rzp1.on('payment.failed', async function (respond) {

                await axios.post(`${url}/purchase/updateTransactionStatus`, {
                    order_id: respond.error.metadata.order_id,
                    payment_id: respond.error.metadata.payment_id,
                    check: false
                }, { headers: { "Authorization": token } });

                alert('Transaction Failed');
            })
        })
        .catch(err => console.log(err));

}

function showExpense(obj) {

    var id = obj.id;
    var amount = obj.amount;
    var des = obj.description;
    var cat = obj.category;

    var val;

    if (des === '')
        val = '₹' + amount + ' - ' + cat;
    else
        val = '₹' + amount + ' - ' + des + ' - ' + cat;

    var list = document.getElementById('listExpenses');

    var li = document.createElement('li');
    li.appendChild(document.createTextNode(val));

    var deleteBtn = document.createElement('button');
    deleteBtn.id = 'deleteBtn';
    deleteBtn.onclick = deleteItem;
    deleteBtn.appendChild(document.createTextNode('Delete'));
    li.appendChild(deleteBtn);


    var invDiv = document.createElement('div');
    invDiv.appendChild(document.createTextNode(`- ${id}`));
    invDiv.style.visibility = 'hidden';
    invDiv.style.float = 'right';
    invDiv.id = 'invTxt';
    li.appendChild(invDiv);

    li.style.padding = '10px';
    list.appendChild(li);

}

function showPremiumUser() {
    try{
        document.getElementById('premiumMsg').style.display = 'block';
        document.getElementById('leaderBoard').style.display = 'block';
        document.getElementById('report').style.display = 'block';
        document.getElementById('premium').style.display = 'none';
    }catch(err){
        document.getElementById('premiumMsg').style.display = 'block';
        document.getElementById('report').style.display = 'block';
        document.getElementById('premium').style.display = 'none';
        console.log(err);
    }
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showLeaderboard(e) {

    if (!leaderBoardStatus) {

        document.getElementById('leaderBoard').innerHTML = 'Hide LeaderBoard';
        leaderBoardStatus = true;

        document.getElementById('leaderTitle').style.display = 'block';
        document.getElementById('listLeaderboard').style.display = 'block';

    } else {
        document.getElementById('leaderBoard').innerHTML = 'Show LeaderBoard';
        leaderBoardStatus = false;


        document.getElementById('leaderTitle').style.display = 'none';
        document.getElementById('listLeaderboard').style.display = 'none';
    }
}

function loadLeaderboard() {
    const token = localStorage.getItem('token');

    axios.get(`${url}/purchase/showLeaderboard`, { headers: { "Authorization": token } })
        .then(respond => {

            for (var i = 0; i < respond.data.userLeaderboard.length; i++) {
                showLeaderboardElement(respond.data.userLeaderboard[i]);
            }

        })
        .catch(err => console.log(err));
}

function showLeaderboardElement(obj) {

    var name = obj.name;
    var amt = obj.total_amount;

    if(amt === null)
        amt = 0;

    var val1 = `Name : ${name}`;
    var val2 =`Total Expense : ₹${amt}`; 

    var list = document.getElementById('listLeaderboard');

    var li = document.createElement('li');

    var div1 = document.createElement('div');
    div1.style.float = 'left';
    div1.appendChild(document.createTextNode(val1));
    li.appendChild(div1);
    
    var div2 = document.createElement('div');
    div2.style.float = 'right';
    div2.appendChild(document.createTextNode(val2));
    li.appendChild(div2);
    
    li.style.padding = '3px';
    list.appendChild(li);

    var br = document.createElement('br');
    list.append(br);


}

function downloadReport(e){
    e.preventDefault();

    const token = localStorage.getItem('token');

    axios.get(`${url}/expense/download`, {headers: {"Authorization" : token}})
        .then(respond => {

            if(respond.status === 200){
                var a = document.createElement('a');
                a.href = respond.data.fileURL;
                a.download = 'myexpense.csv';
                a.click();

                let obj = {
                    url: respond.data.fileURL
                }

                axios.post(`${url}/expense/saveURL`, obj, { headers: { "Authorization": token } })
                    .then(response => {
                        downloadHistory();
                    })
                    .catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
}

function downloadHistory(){
    let token = localStorage.getItem('token');

    axios.get(`${url}/expense/showHistory`, { headers: { "Authorization": token } })
        .then(respond => {

            // console.log(respond.data.history);


            for (var i = 0; i < respond.data.history.length; i++) {
                showHistory(respond.data.history[i], i+1);
            }

        })
        .catch(err => console.log(err));
}

function showHistory(obj , no){

    let date = obj.createdAt;
    date = date.substring(0,10);
    date = date.split('-').reverse().join('-');

    let url = obj.url;

    var table = document.getElementById('reportGenTable');

    var tr = document.createElement('tr');

    var td = document.createElement('td');
    td.appendChild(document.createTextNode(`${no}`));
    tr.appendChild(td);
    
    var td1 = document.createElement('td');
    td1.appendChild(document.createTextNode(`${date}`));
    tr.appendChild(td1);

    var td2 = document.createElement('td');
    var a = document.createElement('a');
    a.href = `${url}`;
    a.appendChild(document.createTextNode(`${url}`));
    td2.appendChild(a);
    tr.appendChild(td2);

    table.appendChild(tr);
}

function showPagination({currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage,}){

        var pagination = document.getElementById('pagination');

        pagination.innerHTML = '';

        if (hasPreviousPage) {
            const btn2 = document.createElement('button');
            btn2.id = 'pageBtn';
            btn2.innerHTML = previousPage;
            btn2.addEventListener('click', () => getExpenses (previousPage));
            pagination.appendChild(btn2)
        }

        const btn1 = document.createElement('button')
        btn1.id = 'pageBtn';
        btn1.innerHTML = `<h3>${currentPage}</h3>`
        btn1.addEventListener('click', () => getExpenses (currentPage));
        pagination.appendChild(btn1);

        if (hasNextPage) {
            const btn3= document.createElement('button');
            btn3.id = 'pageBtn';
            btn3.innerHTML = nextPage;
            btn3.addEventListener('click', () => getExpenses (nextPage));
            pagination.appendChild(btn3);
        };
    }

var perPage = document.getElementById('perPage');

perPage.addEventListener("click", function() {

    var val = document.getElementById('perPage').value;
    localStorage.setItem('perPage', val);
    getExpenses(1);

});