buatkan issue.md yang berisi perancanaan untuk nanti di implementasikan oleh junior programmer atau ai model uyang lebih murah

isi dari planning nya sebgai berikut:

buat api untuk logout user:
endpoint : DELETE api/users/logout

Headers:
Authorization: Bearer <token> (token adalah token yang di table users)

response body:
{
    "message": "success",
    "data": "Logout successful"
}

jika sukses adalah token tersebut di hapus dari database table sessions

response error:
{
    "message": "unauthorized",
    "error": "token not found"
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