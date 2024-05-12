<script lang="ts">
  type C = {}
  abstract class A implements C {}
  class B<T> extends A implements C {
    // private t: T
    public fn(): void {}
    public get a(): number {
      return 42
    }
    public *gen(s: string) {}
  }
  interface I {}
</script>
