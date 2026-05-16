buatkan issue.md yang berisi perancanaan untuk nanti di implementasikan oleh junior programmer atau ai model uyang lebih murah

isi dari planning nya sebgai berikut:

buat table sessions:
id integer auto increment
user_id integer foreign key reference users(id)
token varchar(255) not null(isinya uuid untuk token user login)
expired_at timestamp not null
created_at timestamp not null

buat api untuk login user:
endpoint : POST api/users/login

request body:
{
    "username": "<username>",
    "password": "<password>"
}

response body:
{
    "message": "Login successful",
    "data": {
        "token": "<token>",
        "user": {
            "id": 1,
            "username": "<username>",
            "email": "<email>",
            "created_at": "<created_at>",
            "updated_at": "<updated_at>"
        }
    }
}

response error:
{
    "message": "Invalid credentials",
    "error": "Unauthorized"
}

struktur folder di dalam src
- routes : ini berisi routing elysia js
- services : ini berisi service atau logicnya


struktur file:
-routes : menggunakan format misal user-routes.ts
-services : menggunakan format misal user-service.ts

jelaskan tahapan-tahapan yang harus di lakukan untuk mengimplementasikan hal ini 

anggap nanti yang mengimplementasikan adalah junior programmer atau ai model yang lebih murah

buat issue.md nya yang mudah di pahami