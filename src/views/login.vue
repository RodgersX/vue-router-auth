/* eslint-disable keyword-spacing */
/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
<template>
    <div class="login">
        <form>
            <h4>Login</h4>
            <label for="email">E-Mail Address</label>
            <div>
                <input type="email" required autofocus id="email" v-model="email">
            </div>
            <div>
                <label for="password">Password</label>
                <div>
                    <input type="password" v-model="password" required id="password">
                </div>
            </div>
            <div>
                <button type="submit" @click="handleSubmit">Login</button>
            </div>
        </form>
    </div>
</template>

<script>
export default {

  data () {
    return {
      email: '',
      password: ''
    }
  },

  methods: {
    handleSubmit (e) {
      e.preventDefault()
      if (this.password.length > 0) {
        this.$http.post('http://localhost:3000/login', {
          email: this.email,
          password: this.password
        }).then(response => {
          let is_admin = response.data.user.is_admin
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('jwt', response.data.token)

          if (localStorage.getItem('jwt') != null) {
            this.$emit('loggedin')
            if (this.$route.params.nextUrl != null) {
              this.$router.push(this.$route.params.nextUrl)
            } else {
              if (is_admin === 1) {
                this.$router.push('admin')
              } else {
                this.$router.push('dashboard')
              }
            }
          }
        }).catch(error => {
          console.error(error.response)
        })
      }
    }
  }
}
</script>
